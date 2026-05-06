import { NextResponse } from "next/server";
import { z } from "zod";
import { sanitizeOptionalEmail, sanitizePlainText } from "@/lib/api-validation";
import { createInsForgeServiceClient, getInsForgePublicEnv } from "@/lib/insforge-server";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { SUPPORT_EMAIL } from "@/lib/site-contact";

const bodySchema = z.object({
  summary: z.string().min(1).max(4500),
  steps: z.string().max(8500).optional(),
  browser: z.string().max(220).optional(),
  pageUrl: z.union([z.literal(""), z.string().url()]).optional(),
  screenshotUrl: z.union([z.literal(""), z.string().url()]).optional(),
  contactEmail: z.union([z.literal(""), z.string().email()]).optional(),
});

function ipPrefix(ip: string): string | null {
  if (!ip || ip === "unknown") return null;
  const v4 = ip.split(".");
  if (v4.length === 4) return `${v4[0]}.${v4[1]}.${v4[2]}.x`;
  if (ip.includes(":")) {
    const parts = ip.split(":").filter(Boolean);
    return parts.length ? `${parts.slice(0, 3).join(":")}:…` : null;
  }
  return ip.slice(0, 24);
}

export async function POST(request: Request) {
  if (!getInsForgePublicEnv()) {
    return NextResponse.json({ error: "Service not configured." }, { status: 503 });
  }

  const limiter = rateLimit(`report-bug:${clientIp(request)}`, { limit: 5, windowMs: 3600_000 });
  if (!limiter.ok) {
    return NextResponse.json({ error: "Too many reports from this network. Try later or email support." }, { status: 429 });
  }

  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid report", details: parsed.error.flatten() }, { status: 400 });
  }

  const summary = sanitizePlainText(parsed.data.summary, 4000);
  const steps = parsed.data.steps ? sanitizePlainText(parsed.data.steps, 8000) : null;
  const browser = parsed.data.browser ? sanitizePlainText(parsed.data.browser, 200) : null;
  const pageUrl = parsed.data.pageUrl?.trim() || null;
  const screenshotUrl = parsed.data.screenshotUrl?.trim() || null;
  const contactEmail = sanitizeOptionalEmail(parsed.data.contactEmail?.trim() || null);
  const ua = request.headers.get("user-agent");
  const userAgent = ua ? sanitizePlainText(ua, 500) : null;

  let service;
  try {
    service = createInsForgeServiceClient();
  } catch {
    return NextResponse.json(
      {
        error: `Bug storage is not available. Email ${SUPPORT_EMAIL} with details.`,
        code: "service_key_missing",
      },
      { status: 503 },
    );
  }

  const { error } = await service.database.from("bug_reports").insert([
    {
      summary,
      steps,
      browser,
      page_url: pageUrl,
      screenshot_url: screenshotUrl,
      contact_email: contactEmail,
      user_agent: userAgent,
      ip_prefix: ipPrefix(clientIp(request)),
    },
  ]);

  if (error) {
    console.error("bug_reports insert:", error);
    return NextResponse.json(
      { error: `Could not save report. Email ${SUPPORT_EMAIL}.` },
      { status: 503 },
    );
  }

  return NextResponse.json({ ok: true, message: "Thank you — we received your report." });
}
