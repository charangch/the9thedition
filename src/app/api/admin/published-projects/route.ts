import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createInsForgeServerClient } from "@/lib/insforge-server";
import { requireAdminSession } from "@/lib/admin-session";
import { syncProfessionalProjectCount } from "@/lib/editorial/professional-count";
import { getAllProjects } from "@/lib/project-catalog";

const patchSchema = z.object({
  slug: z.string().min(2),
  action: z.enum(["archive", "unarchive", "delete"]),
});

const selectCols =
  "slug, title, category, published_at, created_at, professional_slug, hero_image_url, editorial_status, archived_at";

export async function GET(request: Request) {
  const admin = await requireAdminSession();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const slugParam = new URL(request.url).searchParams.get("slug")?.trim();
  const client = createInsForgeServerClient(admin.session.accessToken);

  if (slugParam) {
    const { data, error } = await client.database.from("published_projects").select("*").eq("slug", slugParam).limit(1);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    const row = Array.isArray(data) ? data[0] : data;
    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ project: row });
  }
  const primary = await client.database
    .from("published_projects")
    .select(selectCols)
    .order("published_at", { ascending: false })
    .limit(300);

  const result = primary.error
    ? await client.database
        .from("published_projects")
        .select("slug, title, category, created_at, professional_slug, hero_image_url")
        .order("created_at", { ascending: false })
        .limit(300)
    : primary;

  if (result.error) return NextResponse.json({ error: result.error.message }, { status: 400 });

  const dbRows = (Array.isArray(result.data) ? result.data : []).map((row) => {
    const r = row as Record<string, unknown>;
    return {
      slug: String(r.slug),
      title: String(r.title),
      category: String(r.category ?? ""),
      hero_image_url: (r.hero_image_url as string | null) ?? null,
      professional_slug: (r.professional_slug as string | null) ?? null,
      published_at: (r.published_at as string | null) ?? null,
      editorial_status: (r.editorial_status as string | undefined) ?? "published",
      archived_at: (r.archived_at as string | null) ?? null,
      source: "database" as const,
    };
  });

  const dbSlugs = new Set(dbRows.map((r) => r.slug));
  const catalog = getAllProjects()
    .filter((p) => !dbSlugs.has(p.slug))
    .map((p) => ({
      slug: p.slug,
      title: p.title,
      category: p.category,
      hero_image_url: p.image,
      professional_slug: p.architectSlug,
      published_at: null as string | null,
      editorial_status: "catalog" as const,
      archived_at: null as string | null,
      source: "catalog" as const,
    }));

  return NextResponse.json({
    published: dbRows.filter((r) => r.editorial_status !== "archived"),
    archived: dbRows.filter((r) => r.editorial_status === "archived"),
    catalog,
  });
}

export async function PATCH(request: Request) {
  const admin = await requireAdminSession();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const json = await request.json().catch(() => null);
  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const client = createInsForgeServerClient(admin.session.accessToken);
  const now = new Date().toISOString();
  const { slug, action } = parsed.data;

  if (action === "delete") {
    const { data: pubRows } = await client.database
      .from("published_projects")
      .select("professional_id")
      .eq("slug", slug)
      .limit(1);
    const pub = Array.isArray(pubRows) ? pubRows[0] : pubRows;

    const { data: deletedRows, error: deleteErr } = await client.database
      .from("published_projects")
      .delete()
      .eq("slug", slug)
      .select("slug");

    if (deleteErr) return NextResponse.json({ error: deleteErr.message }, { status: 400 });
    const deleted = Array.isArray(deletedRows) ? deletedRows : deletedRows ? [deletedRows] : [];
    if (!deleted.length) {
      return NextResponse.json({ error: `No published project found with slug "${slug}".` }, { status: 404 });
    }

    await client.database.from("admin_publishing_queue").delete().eq("published_slug", slug);
    const proId = (pub as { professional_id?: string } | null)?.professional_id;
    if (proId) await syncProfessionalProjectCount(admin.session.accessToken, proId);

    revalidatePath("/");
    revalidatePath("/projects");
    revalidatePath(`/projects/${slug}`);
    revalidatePath("/professionals");
    revalidatePath("/archive");
    return NextResponse.json({ ok: true, slug });
  }

  const payload =
    action === "archive"
      ? { editorial_status: "archived", archived_at: now, updated_at: now }
      : { editorial_status: "published", archived_at: null, updated_at: now };

  const { data, error } = await client.database
    .from("published_projects")
    .update(payload)
    .eq("slug", slug)
    .select("slug");

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) return NextResponse.json({ error: "Project not found in database." }, { status: 404 });

  revalidatePath("/");
  revalidatePath("/projects");
  revalidatePath(`/projects/${slug}`);
  revalidatePath("/archive");
  revalidatePath(`/archive/${slug}`);
  revalidatePath("/professionals");

  return NextResponse.json({ ok: true, slug, action });
}

export async function DELETE(request: Request) {
  const json = await request.json().catch(() => null);
  const slugParsed = z.object({ slug: z.string().min(2) }).safeParse(json);
  if (!slugParsed.success) return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
  return PATCH(
    new Request(request.url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: slugParsed.data.slug, action: "delete" }),
    }),
  );
}
