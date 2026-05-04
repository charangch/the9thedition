import { NextResponse } from "next/server";
import { z } from "zod";
import { ADMIN_EMAIL_DOMAIN, isAllowedAdminEmail } from "@/lib/admin-auth";
import {
  createInsForgeServerClientPublic,
  getInsForgePublicEnv,
  insforgeNotConfiguredResponse,
} from "@/lib/insforge-server";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { getRequestOrigin } from "@/lib/request-origin";

const bodySchema = z.object({
  email: z.string().email(),
  next: z.string().optional(),
});

export async function POST(request: Request) {
  const limiter = rateLimit(`auth:magic_link:${clientIp(request)}`, { limit: 15, windowMs: 60_000 });
  if (!limiter.ok) {
    return NextResponse.json({ error: "Too many requests. Try again shortly." }, { status: 429 });
  }

  if (!getInsForgePublicEnv()) {
    return insforgeNotConfiguredResponse();
  }

  try {
    const json = await request.json();
    const { email, next } = bodySchema.parse(json);
    if (!isAllowedAdminEmail(email)) {
      return NextResponse.json(
        { error: `Only @${ADMIN_EMAIL_DOMAIN} admin accounts are allowed.` },
        { status: 403 },
      );
    }
    const origin = getRequestOrigin(request);
    const nextPath = next && next.startsWith("/") && !next.startsWith("//") ? next : "/admin";
    const redirectTo = `${origin}/auth/callback?next=${encodeURIComponent(nextPath)}`;

    const client = createInsForgeServerClientPublic();
    const authAny = client.auth as unknown as {
      signInWithOtp: (payload: { email: string; emailRedirectTo: string }) => Promise<{
        error?: { message?: string };
      }>;
    };
    const { error } = await authAny.signInWithOtp({
      email,
      emailRedirectTo: redirectTo,
    });
    if (error) {
      return NextResponse.json({ error: error.message ?? "Could not send magic link." }, { status: 400 });
    }
    return NextResponse.json({ ok: true, message: "Magic link sent. Check your inbox." });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid request";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
