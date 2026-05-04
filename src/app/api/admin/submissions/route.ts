import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { logAdminAction } from "@/lib/admin-audit";
import { createInsForgeServerClient } from "@/lib/insforge-server";
import { defaultLayoutBlocks, normalizeLayoutBlocks } from "@/lib/layout-blocks";
import { parsePublishingSource } from "@/lib/publishing-parser";
import { upsertProfessionalByName } from "@/lib/professionals-db";
import { requireAdminSession } from "@/lib/admin-session";
import { slugifyProject, submissionFormSchema } from "@/lib/submission-template";

const createSchema = z.object({
  contentType: z.enum(["project", "student"]),
  sourceText: z.string().min(1),
  sourcePdfUrl: z.string().url().optional().or(z.literal("")),
  imageUrls: z.array(z.string().url()).max(80).optional(),
  videoLinks: z.array(z.string().url()).max(40).optional(),
  taxonomyName: z.string().max(200).optional(),
  taxonomyKind: z.enum(["professional", "company"]).optional(),
  isTrending: z.boolean().optional(),
  layoutBlocks: z.array(z.record(z.string(), z.unknown())).optional(),
});

const patchSchema = z.object({
  id: z.string().uuid(),
  contentType: z.enum(["project", "student"]).optional(),
  status: z.enum(["pending", "review", "published"]).optional(),
  title: z.string().min(2).max(200).optional(),
  sourceText: z.string().optional(),
  sourcePdfUrl: z.string().url().optional().or(z.literal("")),
  formData: submissionFormSchema.partial().optional(),
  imageUrls: z.array(z.string().url()).max(80).optional(),
  videoLinks: z.array(z.string().url()).max(40).optional(),
  taxonomyName: z.string().max(200).optional(),
  taxonomyKind: z.enum(["professional", "company"]).optional(),
  isTrending: z.boolean().optional(),
  layoutBlocks: z.array(z.record(z.string(), z.unknown())).optional(),
  action: z.enum(["save", "publish"]).optional(),
});

export async function GET() {
  const admin = await requireAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const client = createInsForgeServerClient(admin.session.accessToken);
  const { data, error } = await client.database
    .from("admin_publishing_queue")
    .select(
      "id, content_type, status, title, source_text, source_pdf_url, form_data, image_urls, video_links, layout_blocks, taxonomy_name, taxonomy_kind, is_trending, media, published_slug, published_url, published_at, created_at, updated_at",
    )
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ queue: data ?? [] });
}

export async function POST(request: Request) {
  const admin = await requireAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let payloadJson: unknown;
  try {
    payloadJson = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = createSchema.safeParse(payloadJson);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const sourceText = parsed.data.sourceText;
  const extracted = parsePublishingSource(sourceText);
  const imageUrls = parsed.data.imageUrls ?? [];
  const videoLinks = parsed.data.videoLinks ?? [];
  const pdfUrls = parsed.data.sourcePdfUrl ? [parsed.data.sourcePdfUrl] : [];
  const layoutBlocks = normalizeLayoutBlocks(
    parsed.data.layoutBlocks ??
      defaultLayoutBlocks({
        title: extracted.title,
        body: extracted.longText,
        imageUrls,
        facts: [
          { label: "Project Name", value: extracted.formData.projectName },
          { label: "Architecture Firm", value: extracted.formData.architectureFirm },
          { label: "Project Location", value: extracted.formData.projectLocation },
        ].filter((v) => v.value),
      }),
  );
  const client = createInsForgeServerClient(admin.session.accessToken);
  const { error } = await client.database.from("admin_publishing_queue").insert([
    {
      content_type: parsed.data.contentType,
      status: "pending",
      title: extracted.title,
      source_text: sourceText,
      source_pdf_url: parsed.data.sourcePdfUrl || null,
      form_data: extracted.formData,
      image_urls: imageUrls,
      video_links: videoLinks,
      layout_blocks: layoutBlocks,
      taxonomy_name: parsed.data.taxonomyName?.trim() || null,
      taxonomy_kind: parsed.data.taxonomyKind || null,
      is_trending: parsed.data.isTrending ?? false,
      media: { images: imageUrls, videos: videoLinks, pdfs: pdfUrls },
      published_slug: extracted.slug || null,
      updated_at: new Date().toISOString(),
    },
  ]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  await logAdminAction({
    accessToken: admin.session.accessToken,
    adminUserId: admin.session.user.id,
    action: "publishing_ingested",
    entityType: "admin_publishing_queue",
    entityId: "new-entry",
    payload: { contentType: parsed.data.contentType },
  });

  return NextResponse.json({ ok: true });
}

async function uniqueSlug(
  client: ReturnType<typeof createInsForgeServerClient>,
  table: "published_projects" | "published_students",
  base: string,
) {
  const normalized = base || "untitled-entry";
  let index = 0;
  // Keep this bounded to avoid endless loops on bad DB responses.
  while (index < 50) {
    const candidate = index === 0 ? normalized : `${normalized}-${index + 1}`;
    const { data, error } = await client.database.from(table).select("slug").eq("slug", candidate).limit(1);
    if (error) return candidate;
    const row = Array.isArray(data) ? data[0] : data;
    if (!row) return candidate;
    index += 1;
  }
  return `${normalized}-${Date.now()}`;
}

export async function PATCH(request: Request) {
  const admin = await requireAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let payloadJson: unknown;
  try {
    payloadJson = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(payloadJson);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const client = createInsForgeServerClient(admin.session.accessToken);
  const { data: rows, error: getErr } = await client.database
    .from("admin_publishing_queue")
    .select("*")
    .eq("id", parsed.data.id)
    .limit(1);
  if (getErr) return NextResponse.json({ error: getErr.message }, { status: 400 });
  const row = Array.isArray(rows) ? rows[0] : rows;
  if (!row) return NextResponse.json({ error: "Queue entry not found" }, { status: 404 });

  const mergedFormData = { ...(row.form_data ?? {}), ...(parsed.data.formData ?? {}) };
  const nextTitle = parsed.data.title ?? row.title;
  const nextType = parsed.data.contentType ?? row.content_type;
  const sourceText = parsed.data.sourceText ?? row.source_text ?? "";
  const sourcePdfUrl = parsed.data.sourcePdfUrl || row.source_pdf_url || null;
  const imageUrls = parsed.data.imageUrls ?? row.image_urls ?? [];
  const videoLinks = parsed.data.videoLinks ?? row.video_links ?? [];
  const taxonomyName = parsed.data.taxonomyName?.trim() || row.taxonomy_name || null;
  const taxonomyKind = parsed.data.taxonomyKind || row.taxonomy_kind || null;
  const isTrending = parsed.data.isTrending ?? Boolean(row.is_trending);
  const nextLayoutBlocks = normalizeLayoutBlocks(parsed.data.layoutBlocks ?? row.layout_blocks ?? []);
  const pdfUrls = sourcePdfUrl ? [sourcePdfUrl] : [];
  const now = new Date().toISOString();
  const payload: Record<string, unknown> = {
    content_type: nextType,
    status: parsed.data.status ?? row.status,
    title: nextTitle,
    source_text: sourceText,
    source_pdf_url: sourcePdfUrl,
    form_data: mergedFormData,
    image_urls: imageUrls,
    video_links: videoLinks,
    layout_blocks: nextLayoutBlocks,
    taxonomy_name: taxonomyName,
    taxonomy_kind: taxonomyKind,
    is_trending: isTrending,
    media: { images: imageUrls, videos: videoLinks, pdfs: pdfUrls },
    updated_at: now,
  };

  const shouldPublish = parsed.data.action === "publish";
  let publishedUrl: string | null = null;
  let publishedSlug: string | null = null;
  if (shouldPublish) {
    const baseSlug = slugifyProject(String(mergedFormData.projectName ?? nextTitle ?? "untitled-entry"));
    if (nextType === "student") {
      publishedSlug = await uniqueSlug(client, "published_students", baseSlug);
      publishedUrl = "/awards";
      await client.database.from("published_students").upsert(
        [
          {
            slug: publishedSlug,
            title: nextTitle,
            excerpt: (mergedFormData.shortText as string | undefined) ?? sourceText.slice(0, 220),
            content: (mergedFormData.longText as string | undefined) ?? sourceText,
            school_name: (mergedFormData.architectureFirm as string | undefined) ?? null,
            image_urls: imageUrls,
            video_links: videoLinks,
            form_data: mergedFormData,
            layout_blocks: nextLayoutBlocks,
            media: { images: imageUrls, videos: videoLinks },
            source_queue_id: row.id,
            updated_at: now,
            published_at: now,
          },
        ],
        { onConflict: "slug" },
      );
    } else {
      publishedSlug = await uniqueSlug(client, "published_projects", baseSlug);
      publishedUrl = `/projects/${publishedSlug}`;
      const professional =
        taxonomyName && (taxonomyKind === "professional" || !taxonomyKind)
          ? await upsertProfessionalByName(admin.session.accessToken, taxonomyName)
          : null;
      await client.database.from("published_projects").upsert(
        [
          {
            slug: publishedSlug,
            title: nextTitle,
            excerpt: (mergedFormData.shortText as string | undefined) ?? sourceText.slice(0, 220),
            content: (mergedFormData.longText as string | undefined) ?? sourceText,
            category: "Architecture & Design",
            location: (mergedFormData.projectLocation as string | undefined) ?? null,
            byline: (mergedFormData.architectureFirm as string | undefined)
              ? `By ${(mergedFormData.architectureFirm as string).trim()}`
              : null,
            hero_image_url:
              (mergedFormData.coverImageUrl as string | undefined) ?? (imageUrls[0] as string | undefined) ?? null,
            image_urls: imageUrls,
            video_links: videoLinks,
            external_links: [],
            form_data: mergedFormData,
            layout_blocks: nextLayoutBlocks,
            professional_slug: professional?.slug ?? null,
            professional_id: professional?.id ?? null,
            is_trending: isTrending,
            media: { images: imageUrls, videos: videoLinks, pdfs: pdfUrls },
            updated_at: now,
            published_at: now,
          },
        ],
        { onConflict: "slug" },
      );
    }
    payload.status = "published";
    payload.published_slug = publishedSlug;
    payload.published_url = publishedUrl;
    payload.published_at = now;
    revalidatePath("/projects");
    revalidatePath("/professionals");
    revalidatePath("/");
    revalidatePath("/awards");
  }

  const { error } = await client.database.from("admin_publishing_queue").update(payload).eq("id", row.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  await logAdminAction({
    accessToken: admin.session.accessToken,
    adminUserId: admin.session.user.id,
    action: shouldPublish ? "publishing_published" : "publishing_saved",
    entityType: "admin_publishing_queue",
    entityId: row.id,
    payload: { contentType: nextType, publishedUrl },
  });

  return NextResponse.json({ ok: true, publishedUrl, publishedSlug });
}
