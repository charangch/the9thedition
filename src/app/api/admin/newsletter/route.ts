import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-session";
import { createInsForgeServerClient } from "@/lib/insforge-server";

export async function GET() {
  const admin = await requireAdminSession();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const client = createInsForgeServerClient(admin.session.accessToken);
  const { data, error } = await client.database
    .from("newsletter_subscriptions")
    .select("id, email, subscriber_name, status, source, consent_at, created_at, updated_at")
    .eq("status", "subscribed")
    .order("updated_at", { ascending: false })
    .limit(5000);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ subscribers: data ?? [] });
}

export async function POST() {
  return NextResponse.json(
    { error: "Newsletter sending is disabled. Use export to download subscriber list." },
    { status: 405 },
  );
}
