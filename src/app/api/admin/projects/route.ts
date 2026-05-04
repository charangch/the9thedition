import { NextResponse } from "next/server";
import { z } from "zod";
import { createInsForgeServerClient } from "@/lib/insforge-server";
import { requireAdminSession } from "@/lib/admin-session";

const patchSchema = z.object({
  slug: z.string().min(2),
  title: z.string().min(2).max(200).optional(),
  excerpt: z.string().max(600).optional(),
  category: z.string().max(120).optional(),
  isFeaturedHome: z.boolean().optional(),
});

export async function GET() {
  const admin = await requireAdminSession();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const client = createInsForgeServerClient(admin.session.accessToken);
  const [{ data: submissions, error: submissionsError }, { data: published, error: publishedError }] =
    await Promise.all([
      client.database
        .from("submissions")
        .select("id, title, status, created_at, published_slug")
        .order("created_at", { ascending: false })
        .limit(200),
      client.database
        .from("published_projects")
        .select("slug, title, excerpt, category, published_at, updated_at, is_featured_home")
        .order("published_at", { ascending: false })
        .limit(200),
    ]);

  if (submissionsError) return NextResponse.json({ error: submissionsError.message }, { status: 400 });
  if (publishedError) return NextResponse.json({ error: publishedError.message }, { status: 400 });
  return NextResponse.json({ submissions: submissions ?? [], published: published ?? [] });
}

export async function PATCH(request: Request) {
  const admin = await requireAdminSession();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const json = await request.json().catch(() => null);
  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { slug, ...rest } = parsed.data;
  const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (rest.title !== undefined) payload.title = rest.title;
  if (rest.excerpt !== undefined) payload.excerpt = rest.excerpt;
  if (rest.category !== undefined) payload.category = rest.category;
  if (rest.isFeaturedHome !== undefined) payload.is_featured_home = rest.isFeaturedHome;

  const client = createInsForgeServerClient(admin.session.accessToken);
  const { error } = await client.database.from("published_projects").update(payload).eq("slug", slug);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
