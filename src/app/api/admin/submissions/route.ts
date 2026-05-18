import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { logAdminAction } from "@/lib/admin-audit";
import {
  formatZodIssues,
  projectPublishDraftSchema,
  projectPublishFormSchema,
} from "@/lib/admin/project-publish-schema";
import { resolveProfessionalForPublish } from "@/lib/admin/publish-professional";
import { syncProfessionalProjectCount } from "@/lib/editorial/professional-count";
import { createInsForgeServerClient } from "@/lib/insforge-server";
import { requireAdminSession } from "@/lib/admin-session";
import { QUEUE_STATUS } from "@/lib/admin/queue-status";
import { slugifyProject } from "@/lib/submission-template";

const queueSelect =
  "id, content_type, status, title, form_data, image_urls, video_links, published_slug, published_url, published_at, created_at, updated_at";

const saveSchema = z.object({
  id: z.string().uuid().optional(),
  form: projectPublishDraftSchema,
  action: z.enum(["save", "publish"]).optional(),
});

const patchSchema = z.object({
  id: z.string().uuid(),
  action: z.enum(["save", "publish", "delete"]).optional(),
  form: projectPublishFormSchema.optional(),
});

type DraftForm = z.infer<typeof projectPublishDraftSchema>;

function imageListFromForm(form: DraftForm): string[] {
  const hero = (form.coverImageUrl ?? "").trim();
  const gallery = (form.galleryUrls ?? []).map((u) => u.trim()).filter(Boolean);
  const merged = hero ? [hero, ...gallery.filter((u) => u !== hero)] : gallery;
  return merged.slice(0, 26);
}

function rowFromForm(form: DraftForm) {
  const images = imageListFromForm(form);
  const videoLinks = form.videoUrl?.trim() ? [form.videoUrl.trim()] : [];
  return {
    title: form.projectName,
    form_data: {
      ...form,
      projectName: form.projectName,
      shortText: form.dek,
      longText: form.narrative,
      coverImageUrl: form.coverImageUrl,
    },
    image_urls: images,
    video_links: videoLinks,
    taxonomy_name: form.architectureFirm,
    taxonomy_kind: "professional" as const,
  };
}

async function uniqueSlug(
  client: ReturnType<typeof createInsForgeServerClient>,
  base: string,
  preferred?: string,
) {
  const normalized = slugifyProject(preferred?.trim() || base) || "untitled-project";
  for (let i = 0; i < 50; i++) {
    const candidate = i === 0 ? normalized : `${normalized}-${i + 1}`;
    const { data, error } = await client.database.from("published_projects").select("slug").eq("slug", candidate).limit(1);
    if (error) return candidate;
    const row = Array.isArray(data) ? data[0] : data;
    if (!row) return candidate;
  }
  return `${normalized}-${Date.now()}`;
}

export async function GET() {
  const admin = await requireAdminSession();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const client = createInsForgeServerClient(admin.session.accessToken);
  const [{ data: queueData, error: queueErr }, publishedResult] = await Promise.all([
    client.database.from("admin_publishing_queue").select(queueSelect).order("updated_at", { ascending: false }).limit(100),
    client.database
      .from("published_projects")
      .select("slug, title, category, published_at, hero_image_url, professional_slug, editorial_status, archived_at")
      .neq("editorial_status", "archived")
      .order("published_at", { ascending: false })
      .limit(200),
  ]);

  let publishedData = publishedResult.data;
  let pubErr = publishedResult.error;
  if (pubErr) {
    const fallback = await client.database
      .from("published_projects")
      .select("slug, title, category, published_at, hero_image_url, professional_slug")
      .order("published_at", { ascending: false })
      .limit(200);
    publishedData = (fallback.data ?? []).map((row) => ({
      ...row,
      editorial_status: null,
      archived_at: null,
    }));
    pubErr = fallback.error;
  }

  if (queueErr) return NextResponse.json({ error: queueErr.message }, { status: 400 });

  const queue = (queueData ?? []).filter((row) => {
    const r = row as { status?: string; content_type?: string };
    return r.content_type === "project" && r.status !== "deleted" && r.status !== "archived";
  });

  return NextResponse.json({
    queue,
    published: publishedData ?? [],
    publishedWarning: pubErr?.message ?? null,
  });
}

export async function POST(request: Request) {
  const admin = await requireAdminSession();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = saveSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: formatZodIssues(parsed.error) }, { status: 400 });
  }

  const client = createInsForgeServerClient(admin.session.accessToken);
  const mapped = rowFromForm(parsed.data.form);
  const now = new Date().toISOString();

  const { data, error } = await client.database.from("admin_publishing_queue").insert([
    {
      content_type: "project",
      status: QUEUE_STATUS.DRAFT,
      title: mapped.title,
      source_text: parsed.data.form.narrative,
      form_data: mapped.form_data,
      image_urls: mapped.image_urls,
      video_links: mapped.video_links,
      taxonomy_name: mapped.taxonomy_name,
      taxonomy_kind: mapped.taxonomy_kind,
      layout_blocks: [],
      media: { images: mapped.image_urls, videos: mapped.video_links },
      updated_at: now,
    },
  ]);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  const row = Array.isArray(data) ? data[0] : data;
  const id = (row as { id?: string } | null)?.id;
  return NextResponse.json({ ok: true, id });
}

export async function PATCH(request: Request) {
  const admin = await requireAdminSession();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: formatZodIssues(parsed.error) }, { status: 400 });
  }

  const client = createInsForgeServerClient(admin.session.accessToken);
  const { data: rows, error: getErr } = await client.database
    .from("admin_publishing_queue")
    .select("*")
    .eq("id", parsed.data.id)
    .limit(1);
  if (getErr) return NextResponse.json({ error: getErr.message }, { status: 400 });
  const row = Array.isArray(rows) ? rows[0] : rows;
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const action = parsed.data.action ?? "save";
  const now = new Date().toISOString();

  if (action === "delete") {
    const slug = row.published_slug as string | null;
    await client.database.from("admin_publishing_queue").delete().eq("id", row.id);
    if (slug) {
      const { data: pubRows } = await client.database
        .from("published_projects")
        .select("professional_id")
        .eq("slug", slug)
        .limit(1);
      const pub = Array.isArray(pubRows) ? pubRows[0] : pubRows;
      await client.database.from("published_projects").delete().eq("slug", slug);
      const proId = (pub as { professional_id?: string } | null)?.professional_id;
      if (proId) await syncProfessionalProjectCount(admin.session.accessToken, proId);
    }
    revalidatePath("/");
    revalidatePath("/projects");
    if (slug) revalidatePath(`/projects/${slug}`);
    revalidatePath("/professionals");
    return NextResponse.json({ ok: true });
  }

  const schema = action === "publish" ? projectPublishFormSchema : projectPublishDraftSchema;
  const formParsed = schema.safeParse(parsed.data.form);
  if (!formParsed.success) {
    return NextResponse.json({ error: formatZodIssues(formParsed.error) }, { status: 400 });
  }
  const form = formParsed.data;

  const mapped = rowFromForm(form);
  const payload: Record<string, unknown> = {
    title: mapped.title,
    form_data: mapped.form_data,
    image_urls: mapped.image_urls,
    video_links: mapped.video_links,
    taxonomy_name: mapped.taxonomy_name,
    taxonomy_kind: "professional",
    source_text: form.narrative,
    status: action === "publish" ? QUEUE_STATUS.PUBLISHED : QUEUE_STATUS.DRAFT,
    updated_at: now,
  };

  let publishedUrl: string | null = row.published_url as string | null;
  let publishedSlug: string | null = row.published_slug as string | null;

  if (action === "publish") {
    if (!form.coverImageUrl?.trim()) {
      return NextResponse.json({ error: "Hero image is required." }, { status: 400 });
    }
    if (
      form.architectMode === "existing" &&
      !form.professionalId &&
      !form.architectStaticSlug?.trim()
    ) {
      return NextResponse.json({ error: "Select an existing architect or create a new one." }, { status: 400 });
    }
    if (form.architectMode === "new" && !form.architectureFirm?.trim()) {
      return NextResponse.json({ error: "Architecture firm name is required for a new architect." }, { status: 400 });
    }

    const resolved = await resolveProfessionalForPublish(admin.session.accessToken, form);
    if (!resolved.ok) {
      return NextResponse.json({ error: resolved.message }, { status: 400 });
    }
    const professional = resolved.professional;

    const preferredSlug = form.slug?.trim() || form.projectName;
    publishedSlug =
      publishedSlug ??
      (await uniqueSlug(client, form.projectName, preferredSlug));
    publishedUrl = `/projects/${publishedSlug}`;

    const firmLabel = professional.firm || (form.architectureFirm ?? "").trim();
    const leadLabel = professional.name || (form.leadArchitect ?? "").trim();

    await client.database.from("published_projects").upsert(
      [
        {
          slug: publishedSlug,
          title: form.projectName,
          excerpt: form.dek,
          content: form.narrative,
          category: form.category,
          location: form.projectLocation,
          byline: `By ${firmLabel}`,
          hero_image_url: form.coverImageUrl,
          image_urls: mapped.image_urls,
          video_links: mapped.video_links,
          external_links: [],
          form_data: {
            ...mapped.form_data,
            architectureFirm: firmLabel,
            leadArchitect: leadLabel,
            professionalId: professional.id,
            slug: publishedSlug,
          },
          layout_blocks: [],
          professional_slug: professional.slug,
          professional_id: professional.id,
          is_trending: false,
          is_featured_home: false,
          editorial_status: "published",
          archived_at: null,
          media: { images: mapped.image_urls, videos: mapped.video_links },
          updated_at: now,
          published_at: now,
        },
      ],
      { onConflict: "slug" },
    );

    await syncProfessionalProjectCount(admin.session.accessToken, professional.id);

    payload.published_slug = publishedSlug;
    payload.published_url = publishedUrl;
    payload.published_at = now;

    revalidatePath("/");
    revalidatePath("/projects");
    revalidatePath(`/projects/${publishedSlug}`);
    revalidatePath("/professionals");
    revalidatePath(`/professionals/${professional.slug}`);
  }

  const { error } = await client.database.from("admin_publishing_queue").update(payload).eq("id", row.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  await logAdminAction({
    accessToken: admin.session.accessToken,
    adminUserId: admin.session.user.id,
    action: action === "publish" ? "publishing_published" : "publishing_saved",
    entityType: "admin_publishing_queue",
    entityId: row.id,
    payload: { publishedUrl },
  });

  return NextResponse.json({ ok: true, publishedUrl, publishedSlug });
}
