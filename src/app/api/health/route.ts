import { NextResponse } from "next/server";

/** Uptime checks and load balancers — no auth, minimal payload. */
export async function GET() {
  return NextResponse.json(
    { ok: true, service: "the9thedition-web", ts: new Date().toISOString() },
    { headers: { "Cache-Control": "no-store" } },
  );
}
