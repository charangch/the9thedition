import { NextResponse } from "next/server";
import {
  createInsForgeServerClientPublic,
  getInsForgePublicEnv,
  insforgeNotConfiguredResponse,
} from "@/lib/insforge-server";

export async function GET() {
  if (!getInsForgePublicEnv()) {
    return insforgeNotConfiguredResponse();
  }
  try {
    const client = createInsForgeServerClientPublic();
    const { data, error } = await client.auth.getPublicAuthConfig();
    if (error || !data) {
      return NextResponse.json(
        { error: error?.message ?? "Could not load auth configuration." },
        { status: 502 },
      );
    }
    return NextResponse.json(data);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Configuration error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
