import { NextResponse } from "next/server";
import { z } from "zod";
import {
  createInsForgeServerClientPublic,
  getInsForgePublicEnv,
  insforgeNotConfiguredResponse,
} from "@/lib/insforge-server";
import { getRequestOrigin } from "@/lib/request-origin";

const bodySchema = z.object({
  email: z.string().email(),
});

export async function POST(request: Request) {
  if (!getInsForgePublicEnv()) {
    return insforgeNotConfiguredResponse();
  }
  try {
    const json = await request.json();
    const { email } = bodySchema.parse(json);
    const origin = getRequestOrigin(request);
    const redirectTo = `${origin}/login?verify=link`;

    const client = createInsForgeServerClientPublic();
    const { error } = await client.auth.resendVerificationEmail({ email, redirectTo });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      ok: true,
      message: "Check your inbox for a new verification link or code.",
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Invalid request";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
