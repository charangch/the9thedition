import { NextResponse } from "next/server";
import { z } from "zod";
import {
  createInsForgeServerClientPublic,
  getInsForgePublicEnv,
  insforgeNotConfiguredResponse,
} from "@/lib/insforge-server";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { getRequestOrigin } from "@/lib/request-origin";

const bodySchema = z.object({
  email: z.string().email(),
});

/**
 * Always returns 200 with a generic message when the email is syntactically valid,
 * to avoid account enumeration. InsForge still sends the email only if the user exists.
 */
export async function POST(request: Request) {
  const limiter = rateLimit(`auth:forgot_password:${clientIp(request)}`, {
    limit: 8,
    windowMs: 60_000,
  });
  if (!limiter.ok) {
    return NextResponse.json(
      { error: "Too many reset requests. Please wait a minute and try again." },
      { status: 429 },
    );
  }

  if (!getInsForgePublicEnv()) {
    return insforgeNotConfiguredResponse();
  }
  try {
    const json = await request.json();
    const { email } = bodySchema.parse(json);
    const origin = getRequestOrigin(request);
    const redirectTo = `${origin}/reset-password`;

    const client = createInsForgeServerClientPublic();
    await client.auth.sendResetPasswordEmail({ email, redirectTo });

    return NextResponse.json({
      ok: true,
      message:
        "If an account exists for that email, you will receive a password reset link shortly. Links expire after a short time for security.",
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Invalid request";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
