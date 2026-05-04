import { NextResponse } from "next/server";
import { z } from "zod";
import { createInsForgeServerClient } from "@/lib/insforge-server";
import { requireAdminSession } from "@/lib/admin-session";

const patchSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["new", "contacted", "closed"]).optional(),
  internalNotes: z.string().max(5000).optional(),
});

export async function GET(request: Request) {
  const admin = await requireAdminSession();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  const client = createInsForgeServerClient(admin.session.accessToken);
  let query = client.database
    .from("inquiries")
    .select("id, project_id, name, email, phone_e164, message, status, internal_notes, created_at, updated_at")
    .order("created_at", { ascending: false })
    .limit(400);

  if (status && ["new", "contacted", "closed"].includes(status)) {
    query = query.eq("status", status);
  }
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const leads = data ?? [];
  const projectSlugs = Array.from(
    new Set(
      leads
        .map((lead) => lead.project_id)
        .filter((value): value is string => Boolean(value) && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)),
    ),
  );

  const titleBySlug = new Map<string, string>();
  if (projectSlugs.length > 0) {
    const { data: projects } = await client.database
      .from("published_projects")
      .select("slug, title")
      .in("slug", projectSlugs);
    (projects ?? []).forEach((project: { slug?: string; title?: string | null }) => {
      if (project.slug && project.title) titleBySlug.set(project.slug, project.title);
    });
  }

  return NextResponse.json({
    leads: leads.map((lead) => ({
      ...lead,
      project_title: titleBySlug.get(lead.project_id) ?? null,
      project_url: titleBySlug.has(lead.project_id) ? `/projects/${lead.project_id}` : null,
    })),
  });
}

export async function PATCH(request: Request) {
  const admin = await requireAdminSession();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const json = await request.json().catch(() => null);
  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (parsed.data.status) payload.status = parsed.data.status;
  if (parsed.data.internalNotes !== undefined) payload.internal_notes = parsed.data.internalNotes;
  const client = createInsForgeServerClient(admin.session.accessToken);
  const { error } = await client.database.from("inquiries").update(payload).eq("id", parsed.data.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
