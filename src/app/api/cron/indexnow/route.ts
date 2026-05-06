import { NextResponse } from "next/server";
import { submitUrlsToIndexNow } from "@/lib/indexnow";
import { getSiteUrl } from "@/lib/site-url";

/**
 * Vercel Cron: set CRON_SECRET in project env; Vercel sends Authorization: Bearer <CRON_SECRET>.
 * Pings IndexNow with the homepage (extend to admin-triggered URL list later).
 */
export async function GET(request: Request) {
  const expected = process.env.CRON_SECRET?.trim();
  const auth = request.headers.get("authorization");
  if (!expected || auth !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const base = getSiteUrl();
  const result = await submitUrlsToIndexNow([`${base}/`, `${base}/sitemap.xml`]);
  return NextResponse.json({
    ok: result.ok,
    indexNowStatus: result.status,
    urls: [`${base}/`, `${base}/sitemap.xml`],
  });
}
