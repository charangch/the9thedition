import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminSession } from "@/lib/admin-session";

const bodySchema = z.object({
  url: z.string().url(),
  kind: z.enum(["image", "video"]).default("image"),
});

/** Validates a remote media URL and returns it for use in project pages (Next Image uses unoptimized for externals). */
export async function POST(request: Request) {
  const admin = await requireAdminSession();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid URL" }, { status: 400 });

  const url = parsed.data.url.trim();
  try {
    const res = await fetch(url, { method: "HEAD", redirect: "follow" });
    const contentType = res.headers.get("content-type") ?? "";
    if (parsed.data.kind === "image" && !contentType.startsWith("image/")) {
      const getRes = await fetch(url, { method: "GET", redirect: "follow" });
      const getType = getRes.headers.get("content-type") ?? "";
      if (!getType.startsWith("image/")) {
        return NextResponse.json(
          { error: "URL does not appear to be an image. Upload a file or use a direct image link." },
          { status: 400 },
        );
      }
    }
  } catch {
    // Allow URL anyway — page will use unoptimized Image; broken links surface in preview.
  }

  return NextResponse.json({ ok: true, url });
}
