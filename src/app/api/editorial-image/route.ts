import { NextResponse } from "next/server";
import { buildingImageUrlForSlug } from "@/lib/luxury-building-sets";

const COLLECTIONS = new Set(["archive", "articles"]);

async function fetchImage(target: string): Promise<{ bytes: ArrayBuffer; contentType: string } | null> {
  const upstream = await fetch(target, {
    headers: { Accept: "image/jpeg,image/*" },
    signal: AbortSignal.timeout(12_000),
  }).catch(() => null);
  if (!upstream?.ok) return null;
  const contentType = upstream.headers.get("content-type") ?? "";
  if (!contentType.startsWith("image/")) return null;
  const bytes = await upstream.arrayBuffer().catch(() => null);
  if (!bytes) return null;
  return { bytes, contentType };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const collection = searchParams.get("collection") ?? "";
  const slug = searchParams.get("slug") ?? "";
  const index = parseInt(searchParams.get("index") ?? "0", 10);

  if (!COLLECTIONS.has(collection) || !slug || slug.length > 220 || Number.isNaN(index) || index < 0 || index > 5) {
    return new NextResponse("Not found", { status: 404 });
  }

  const target = buildingImageUrlForSlug(slug, index);
  const image = await fetchImage(target);
  if (!image) {
    return new NextResponse("Upstream image unavailable", { status: 502 });
  }

  return new NextResponse(image.bytes, {
    status: 200,
    headers: {
      "Content-Type": image.contentType,
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
    },
  });
}
