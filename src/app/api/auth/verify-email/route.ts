import { NextResponse } from "next/server";
import { z } from "zod";
import { ensureReaderProfile } from "@/lib/ensure-profile";
import { setAuthCookies } from "@/lib/auth-cookies";
import {
  createInsForgeServerClientPublic,
  getInsForgePublicEnv,
  insforgeNotConfiguredResponse,
} from "@/lib/insforge-server";

const bodySchema = z.object({
  email: z.string().email(),
  otp: z.string().regex(/^\d{6}$/, "Enter the 6-digit code from your email."),
});

export async function POST(request: Request) {
  if (!getInsForgePublicEnv()) {
    return insforgeNotConfiguredResponse();
  }
  try {
    const json = await request.json();
    const { email, otp } = bodySchema.parse(json);

    const client = createInsForgeServerClientPublic();
    const { data, error } = await client.auth.verifyEmail({ email, otp });

    if (error || !data?.accessToken) {
      return NextResponse.json(
        { error: error?.message ?? "Invalid or expired code." },
        { status: 400 },
      );
    }

    await setAuthCookies(data.accessToken, data.refreshToken);
    await ensureReaderProfile(data.accessToken);

    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Invalid request";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
