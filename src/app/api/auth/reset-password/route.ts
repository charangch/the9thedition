import { NextResponse } from "next/server";
import { z } from "zod";
import {
  createInsForgeServerClientPublic,
  getInsForgePublicEnv,
  insforgeNotConfiguredResponse,
} from "@/lib/insforge-server";
import { policyFromPublicConfig, validatePassword } from "@/lib/password-policy";
import { clientIp, rateLimit } from "@/lib/rate-limit";

const linkBody = z.object({
  mode: z.literal("token").optional(),
  newPassword: z.string().min(1),
  /** Magic-link or short-lived token from InsForge (code exchange or URL). */
  otp: z.string().min(1),
});

const codeBody = z.object({
  mode: z.literal("code"),
  email: z.string().email(),
  code: z.string().min(4),
  newPassword: z.string().min(1),
});

const bodySchema = z.union([linkBody, codeBody]);

export async function POST(request: Request) {
  const limiter = rateLimit(`auth:reset_password:${clientIp(request)}`, {
    limit: 12,
    windowMs: 60_000,
  });
  if (!limiter.ok) {
    return NextResponse.json(
      { error: "Too many attempts. Please request a new reset email and try again shortly." },
      { status: 429 },
    );
  }

  if (!getInsForgePublicEnv()) {
    return insforgeNotConfiguredResponse();
  }
  try {
    const json = await request.json();
    const parsed = bodySchema.parse(json);

    const client = createInsForgeServerClientPublic();
    const { data: pub, error: pubErr } = await client.auth.getPublicAuthConfig();
    if (pubErr || !pub) {
      return NextResponse.json(
        { error: pubErr?.message ?? "Auth configuration unavailable." },
        { status: 503 },
      );
    }

    const policy = policyFromPublicConfig(pub);
    const pwdErr = validatePassword(parsed.newPassword, policy);
    if (pwdErr) {
      return NextResponse.json({ error: pwdErr }, { status: 400 });
    }

    if ("mode" in parsed && parsed.mode === "code") {
      const { data: ex, error: exErr } = await client.auth.exchangeResetPasswordToken({
        email: parsed.email,
        code: parsed.code,
      });
      if (exErr || !ex?.token) {
        return NextResponse.json(
          { error: exErr?.message ?? "Invalid or expired reset code." },
          { status: 400 },
        );
      }

      const { error: resetErr } = await client.auth.resetPassword({
        newPassword: parsed.newPassword,
        otp: ex.token,
      });

      if (resetErr) {
        return NextResponse.json({ error: resetErr.message }, { status: 400 });
      }

      return NextResponse.json({
        ok: true,
        message: "Your password was updated. Sign in with your new password.",
        resetTokenExpiresAt: ex.expiresAt,
      });
    }

    const { error } = await client.auth.resetPassword({
      newPassword: parsed.newPassword,
      otp: parsed.otp,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      ok: true,
      message: "Your password was updated. Sign in with your new password.",
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Invalid request";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
