import { NextResponse } from "next/server";
import { z } from "zod";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { submitUrlsToIndexNow } from "@/lib/indexnow";
import { getSiteUrl } from "@/lib/site-url";

const bodySchema = z.object({
  urls: z.array(z.string().url()).min(1).max(10_000),
});

function authorize(request: Request): boolean {
  const secret = process.env.INDEXNOW_WEBHOOK_SECRET?.trim();
  if (!secret) return false;
  const auth = request.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}

export async function POST(request: Request) {
  if (!authorize(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limiter = rateLimit(`indexnow:hook:${clientIp(request)}`, { limit: 30, windowMs: 60_000 });
  if (!limiter.ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body", details: parsed.error.flatten() }, { status: 400 });
  }

  const host = new URL(getSiteUrl()).host;
  for (const u of parsed.data.urls) {
    try {
      if (new URL(u).host !== host) {
        return NextResponse.json({ error: "URL host must match site" }, { status: 400 });
      }
    } catch {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }
  }

  const result = await submitUrlsToIndexNow(parsed.data.urls);
  return NextResponse.json(
    { ok: result.ok, indexNowStatus: result.status, indexNowBody: result.body },
    { status: result.ok ? 200 : 502 },
  );
}
