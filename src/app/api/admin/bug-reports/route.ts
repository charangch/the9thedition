import { NextResponse } from "next/server";
import { createInsForgeServiceClient, InsForgeConfigurationError } from "@/lib/insforge-server";
import { requireAdminSession } from "@/lib/admin-session";

export async function GET() {
  const admin = await requireAdminSession();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const service = createInsForgeServiceClient();
    const { data, error } = await service.database
      .from("bug_reports")
      .select("id, created_at, summary, steps, browser, page_url, screenshot_url, contact_email, user_agent, ip_prefix")
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ reports: data ?? [] });
  } catch (err) {
    if (err instanceof InsForgeConfigurationError) {
      return NextResponse.json(
        {
          error:
            "INSFORGE_SERVICE_KEY is not set. Add it to web/.env.local so admin can read bug reports.",
        },
        { status: 503 },
      );
    }
    throw err;
  }
}
