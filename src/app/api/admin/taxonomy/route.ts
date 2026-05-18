import { NextResponse } from "next/server";
import { buildArchitectOptions } from "@/lib/admin/architect-options";
import { requireAdminSession } from "@/lib/admin-session";
import { getCompanies, getProfessionals } from "@/lib/professionals-db";

export async function GET() {
  const admin = await requireAdminSession();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const [professionals, companies] = await Promise.all([getProfessionals(500), getCompanies(500)]);
  return NextResponse.json({
    professionals,
    companies,
    architectOptions: buildArchitectOptions(professionals),
  });
}
