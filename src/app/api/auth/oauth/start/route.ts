import { NextResponse } from "next/server";
import { z } from "zod";
import { setOAuthVerifierCookie } from "@/lib/auth-cookies";
import {
  createInsForgeServerClientPublic,
  getInsForgePublicEnv,
  insforgeNotConfiguredResponse,
} from "@/lib/insforge-server";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { getRequestOrigin } from "@/lib/request-origin";

const bodySchema = z.object({
  provider: z.enum(["google"]).default("google"),
  next: z.string().optional(),
});

export async function POST(request: Request) {
  const limiter = rateLimit(`auth:oauth_start:${clientIp(request)}`, { limit: 30, windowMs: 60_000 });
  if (!limiter.ok) {
    return NextResponse.json({ error: "Too many login attempts. Please wait a moment." }, { status: 429 });
  }

  if (!getInsForgePublicEnv()) {
    return insforgeNotConfiguredResponse();
  }
  try {
    const json = await request.json();
    const { provider, next } = bodySchema.parse(json);
    const origin = getRequestOrigin(request);
    const nextPath =
      next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
    const redirectTo = `${origin}/auth/callback?next=${encodeURIComponent(nextPath)}`;

    const client = createInsForgeServerClientPublic();
    const { data, error } = await client.auth.signInWithOAuth({
      provider,
      redirectTo,
      skipBrowserRedirect: true,
    });

    if (error || !data?.url) {
      return NextResponse.json(
        { error: error?.message ?? "OAuth start failed" },
        { status: 400 },
      );
    }

    // Let the user pick which Google account to use (avoid silent reuse of last browser session).
    let oauthUrl = data.url;
    if (provider === "google" && oauthUrl) {
      try {
        const u = new URL(oauthUrl);
        if (u.hostname.includes("google.com")) {
          u.searchParams.set("prompt", "select_account");
          oauthUrl = u.toString();
        }
      } catch {
        /* keep original url */
      }
    }

    if (data.codeVerifier) {
      await setOAuthVerifierCookie(data.codeVerifier);
    }

    return NextResponse.json({ url: oauthUrl });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Invalid request";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
