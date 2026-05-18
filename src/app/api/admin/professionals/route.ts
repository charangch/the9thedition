import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createInsForgeServerClient } from "@/lib/insforge-server";
import { requireAdminSession } from "@/lib/admin-session";
import { getProfessionals } from "@/lib/professionals-db";
import { syncProfessionalProjectCount } from "@/lib/editorial/professional-count";

export async function GET() {
  const admin = await requireAdminSession();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const professionals = await getProfessionals(500);
  return NextResponse.json({ professionals });
}

const deleteSchema = z.object({
  id: z.string().uuid(),
});

export async function DELETE(request: Request) {
  const admin = await requireAdminSession();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const json = await request.json().catch(() => null);
  const parsed = deleteSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const client = createInsForgeServerClient(admin.session.accessToken);
  const { data: proRows } = await client.database
    .from("professionals")
    .select("slug")
    .eq("id", parsed.data.id)
    .limit(1);
  const pro = Array.isArray(proRows) ? proRows[0] : proRows;
  const slug = (pro as { slug?: string } | null)?.slug;

  await client.database.from("published_projects").update({ professional_id: null, professional_slug: null }).eq("professional_id", parsed.data.id);

  const { error } = await client.database.from("professionals").delete().eq("id", parsed.data.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  revalidatePath("/professionals");
  if (slug) revalidatePath(`/professionals/${slug}`);
  return NextResponse.json({ ok: true });
}
