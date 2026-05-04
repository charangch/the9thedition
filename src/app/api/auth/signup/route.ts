import { NextResponse } from "next/server";
import { z } from "zod";
import { isAllowedAdminEmail } from "@/lib/admin-auth";
import {
  createInsForgeServerClientPublic,
  getInsForgePublicEnv,
  insforgeNotConfiguredResponse,
} from "@/lib/insforge-server";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { getRequestOrigin } from "@/lib/request-origin";

const devBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

/**
 * Public sign-up is disabled in production.
 * In **local development only**, set `ALLOW_DEV_SIGNUP=true` to exercise InsForge
 * `signUp` + email verification (check InsForge logs / inbox for the project).
 */
export async function POST(request: Request) {
  const devSignup = process.env.NODE_ENV === "development" && process.env.ALLOW_DEV_SIGNUP === "true";
  if (!devSignup) {
    return NextResponse.json(
      { error: "Public sign-up is disabled. Only admin accounts are allowed." },
      { status: 403 },
    );
  }

  const limiter = rateLimit(`auth:dev-signup:${clientIp(request)}`, { limit: 8, windowMs: 60_000 });
  if (!limiter.ok) {
    return NextResponse.json({ error: "Too many sign-up attempts. Try again shortly." }, { status: 429 });
  }

  if (!getInsForgePublicEnv()) {
    return insforgeNotConfiguredResponse();
  }

  try {
    const json = await request.json();
    const { email, password } = devBodySchema.parse(json);
    if (!isAllowedAdminEmail(email)) {
      return NextResponse.json(
        { error: "Dev sign-up only allows @theninthedition.com addresses (same as admin login)." },
        { status: 400 },
      );
    }

    const origin = getRequestOrigin(request);
    const redirectTo = `${origin}/login?verify=link`;

    const client = createInsForgeServerClientPublic();
    const { data, error } = await client.auth.signUp({
      email,
      password,
      redirectTo,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const user = data?.user;
    const accessToken = data?.accessToken;
    const requireEmailVerification = data?.requireEmailVerification === true;

    return NextResponse.json({
      ok: true,
      message:
        accessToken != null
          ? "Signed up and tokens returned (InsForge did not require email verification for this sign-up, or the address was already verified)."
          : requireEmailVerification
            ? "Sign-up accepted; InsForge indicates email verification is required — check this inbox for a link or code."
            : "Sign-up accepted. Check the inbox for this address if your InsForge project sends a verification email.",
      userId: user?.id ?? null,
      email: user?.email ?? email,
      emailVerified: user?.emailVerified ?? false,
      hasSession: Boolean(accessToken),
      requireEmailVerification,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Invalid request";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
