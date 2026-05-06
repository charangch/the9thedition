import { NextResponse } from "next/server";
import { z } from "zod";
import { sendLeadNotificationEmail } from "@/app/actions/lead-notify";
import { sanitizePlainText } from "@/lib/api-validation";
import {
  createInsForgeServerClientPublic,
  getInsForgePublicEnv,
  insforgeNotConfiguredResponse,
} from "@/lib/insforge-server";
import { clientIp, rateLimit } from "@/lib/rate-limit";

const e164 = z
  .string()
  .trim()
  .transform((s) => s.replace(/\s/g, ""))
  .pipe(
    z
      .string()
      .regex(
        /^\+[1-9]\d{6,14}$/,
        "Use international format with + and country code (7–15 digits after +). Example: +919876543210",
      ),
  );

const bodySchema = z.object({
  projectSlug: z.string().min(1).max(200),
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email(),
  phone: e164,
  message: z.string().trim().min(10).max(5000),
});

function formatInsertError(error: unknown): string {
  if (error && typeof error === "object") {
    const o = error as Record<string, unknown>;
    const msg = o.message ?? o.error ?? o.details ?? o.hint;
    if (typeof msg === "string" && msg.trim()) return msg.trim();
  }
  if (typeof error === "string" && error.trim()) return error.trim();
  return "unknown_error";
}

export async function POST(request: Request) {
  if (!getInsForgePublicEnv()) {
    return insforgeNotConfiguredResponse();
  }

  const limiter = rateLimit(`enquiry:${clientIp(request)}`, { limit: 15, windowMs: 60_000 });
  if (!limiter.ok) {
    return NextResponse.json({ error: "Too many requests. Try again shortly." }, { status: 429 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    const flat = parsed.error.flatten();
    const first =
      flat.fieldErrors.phone?.[0] ??
      flat.fieldErrors.email?.[0] ??
      flat.fieldErrors.name?.[0] ??
      flat.fieldErrors.message?.[0] ??
      flat.fieldErrors.projectSlug?.[0] ??
      "Check the form fields.";
    return NextResponse.json({ error: first, details: flat }, { status: 400 });
  }

  const projectSlug = parsed.data.projectSlug.trim().replace(/[\r\n\0]/g, "").slice(0, 200);
  const name = sanitizePlainText(parsed.data.name, 120);
  const email = sanitizePlainText(parsed.data.email, 320);
  const phone = parsed.data.phone;
  const message = sanitizePlainText(parsed.data.message, 5000);

  const db = createInsForgeServerClientPublic();
  const { error } = await db.database.from("inquiries").insert([
    {
      project_id: projectSlug,
      name,
      email,
      phone_e164: phone,
      message,
      status: "new",
      internal_notes: null,
    },
  ]);

  if (error) {
    console.error("project_enquiries insert:", formatInsertError(error), error);
    return NextResponse.json(
      { error: "Could not submit enquiry. Try again later or contact support." },
      { status: 503 },
    );
  }

  await sendLeadNotificationEmail({
    projectSlug,
    name,
    email,
    phone,
    message,
  });

  return NextResponse.json({
    ok: true,
    message: "Thank you. The team will follow up by email.",
  });
}
