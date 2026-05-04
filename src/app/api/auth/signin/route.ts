import { NextResponse } from "next/server";
import { z } from "zod";
import { clearAuthCookies, setAuthCookies } from "@/lib/auth-cookies";
import { isAdminSession, isAllowedAdminEmail, normalizeEmail } from "@/lib/admin-auth";
import {
  createInsForgeServerClientPublic,
  getInsForgePublicEnv,
  insforgeNotConfiguredResponse,
} from "@/lib/insforge-server";
import { clientIp, rateLimit } from "@/lib/rate-limit";

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  const limiter = rateLimit(`auth:signin:${clientIp(request)}`, { limit: 20, windowMs: 60_000 });
  if (!limiter.ok) {
    return NextResponse.json({ error: "Too many sign-in attempts. Try again shortly." }, { status: 429 });
  }

  if (!getInsForgePublicEnv()) {
    return insforgeNotConfiguredResponse();
  }
  try {
    const json = await request.json();
    const { email: rawEmail, password } = bodySchema.parse(json);
    const email = normalizeEmail(rawEmail);
    if (!isAllowedAdminEmail(email)) {
      return NextResponse.json(
        { error: "Only @theninthedition.com admin accounts can sign in." },
        { status: 403 },
      );
    }

    const client = createInsForgeServerClientPublic();
    const { data, error } = await client.auth.signInWithPassword({ email, password });

    if (error) {
      const msg = (error.message ?? "").toLowerCase();
      const errKey = (error.error ?? "").toLowerCase();
      const looksUnverified =
        msg.includes("email not confirmed") ||
        msg.includes("not verified") ||
        msg.includes("email not verified") ||
        msg.includes("confirm your email") ||
        errKey.includes("email_not_confirmed") ||
        errKey.includes("not_verified");
      const code = looksUnverified ? "email_not_verified" : "sign_in_failed";
      const status = looksUnverified ? 403 : error.statusCode === 429 ? 429 : 400;
      return NextResponse.json(
        { error: error.message, code },
        { status },
      );
    }

    if (!data?.accessToken) {
      return NextResponse.json({ error: "Sign in failed." }, { status: 400 });
    }

    const allowed = await isAdminSession(data.accessToken, data.user.id);
    if (!allowed) {
      await clearAuthCookies();
      return NextResponse.json(
        { error: "This account is not an admin.", code: "admin_only" },
        { status: 403 },
      );
    }

    await setAuthCookies(data.accessToken, data.refreshToken);

    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Invalid request";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
