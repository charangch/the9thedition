import { NextResponse } from "next/server";

const COLLECTIONS = new Set(["articles", "news", "archive", "top100", "projects"]);

function hash(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

const ARCHITECTURE_IMAGE_POOL = [
  "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd",
  "https://images.unsplash.com/photo-1494526585095-c41746248156",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
  "https://images.unsplash.com/photo-1600607687644-c7171b42498f",
  "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b",
  "https://images.unsplash.com/photo-1613977257363-707ba9348227",
  "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d",
  "https://images.unsplash.com/photo-1600047508788-786f48fce61d",
  "https://images.unsplash.com/photo-1484154218962-a197022b5858",
  "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0",
  "https://images.unsplash.com/photo-1600563438938-a9a27216b2a3",
  "https://images.unsplash.com/photo-1616593969747-4797dc75033e",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c",
  "https://images.unsplash.com/photo-1600573472550-8090b5e0745e",
  "https://images.unsplash.com/photo-1600566753190-bf308bd2b5c8",
  "https://images.unsplash.com/photo-1600607688969-a5bfcd646154",
  "https://images.unsplash.com/photo-1511818966892-d7d671e672a2",
  "https://images.unsplash.com/photo-1464146072230-91cabc968266",
  "https://images.unsplash.com/photo-1483366774565-c783b9f70e2c",
  "https://images.unsplash.com/photo-1479839672679-a46483c0e7c8",
  "https://images.unsplash.com/photo-1600607687654-8f8d43d8a5f2",
  "https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6",
  "https://images.unsplash.com/photo-1523217582562-09d0def993a6",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688",
  "https://images.unsplash.com/photo-1600607687645-c7171b42498f",
  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6",
  "https://images.unsplash.com/photo-1600047509359-cacb95f69f84",
  "https://images.unsplash.com/photo-1600607687126-8a3414349a51",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c",
  "https://images.unsplash.com/photo-1600585154526-990dced4db0d",
];

const INTERIOR_IMAGE_POOL = [
  "https://images.unsplash.com/photo-1600210491369-e753d80a41f3",
  "https://images.unsplash.com/photo-1600607688969-a5bfcd646154",
  "https://images.unsplash.com/photo-1600607687644-c7171b42498f",
  "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d",
  "https://images.unsplash.com/photo-1600573472591-ee6b68d14c68",
  "https://images.unsplash.com/photo-1600047508788-786f48fce61d",
  "https://images.unsplash.com/photo-1600047509358-9dc75507daeb",
  "https://images.unsplash.com/photo-1600047509782-20d39509f26d",
  "https://images.unsplash.com/photo-1484154218962-a197022b5858",
  "https://images.unsplash.com/photo-1493666438817-866a91353ca9",
  "https://images.unsplash.com/photo-1505691938895-1758d7feb511",
  "https://images.unsplash.com/photo-1503602642458-232111445657",
];

const PRODUCT_IMAGE_POOL = [
  "https://images.unsplash.com/photo-1505691938895-1758d7feb511",
  "https://images.unsplash.com/photo-1555041469-a586c61ea9bc",
  "https://images.unsplash.com/photo-1493666438817-866a91353ca9",
  "https://images.unsplash.com/photo-1503602642458-232111445657",
  "https://images.unsplash.com/photo-1556912167-f556f1f39fdf",
  "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136",
  "https://images.unsplash.com/photo-1538688525198-9b88f6f53126",
  "https://images.unsplash.com/photo-1582582621959-48d27397dc69",
  "https://images.unsplash.com/photo-1581539250439-c96689b516dd",
  "https://images.unsplash.com/photo-1617104551722-3b2d51366468",
  "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85",
  "https://images.unsplash.com/photo-1493666438817-866a91353ca9",
];

function choosePool(collection: string, key: string): string[] {
  const slug = key.toLowerCase();
  if (collection === "articles" && (slug.includes("product") || slug.includes("specification") || slug.includes("materials"))) {
    return [...PRODUCT_IMAGE_POOL, ...INTERIOR_IMAGE_POOL, ...ARCHITECTURE_IMAGE_POOL];
  }
  if (slug.includes("interior") || slug.includes("apartment")) {
    return [...INTERIOR_IMAGE_POOL, ...ARCHITECTURE_IMAGE_POOL];
  }
  return ARCHITECTURE_IMAGE_POOL;
}

function normalizeUnsplashUrl(base: string, seed: number): string {
  const u = new URL(base);
  u.searchParams.set("auto", "format");
  u.searchParams.set("fit", "crop");
  u.searchParams.set("w", "1280");
  u.searchParams.set("h", "720");
  u.searchParams.set("q", "72");
  u.searchParams.set("fm", "jpg");
  u.searchParams.set("cs", "tinysrgb");
  const sat = ((seed % 9) - 4) * 5;
  if (sat !== 0) u.searchParams.set("sat", String(sat));
  return u.toString();
}

function resolvePhotoCandidates(collection: string, key: string, index: number): string[] {
  const pool = choosePool(collection, key);
  const seed = hash(`${collection}|${key}|${index}`);
  const start = seed % pool.length;
  const step = 11;
  const out: string[] = [];
  const tries = Math.min(8, pool.length);
  for (let t = 0; t < tries; t += 1) {
    const pick = (start + t * step) % pool.length;
    out.push(normalizeUnsplashUrl(pool[pick]!, seed + t * 19));
  }
  return out;
}

export function buildGeneratedSvg(collection: string, key: string, index: number): string {
  const seed = hash(`${collection}|${key}|${index}`);
  const w = 1600;
  const h = 900;
  const hue = seed % 360;
  const hue2 = (hue + 30) % 360;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-hidden="true">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="hsl(${hue},30%,72%)"/>
      <stop offset="100%" stop-color="hsl(${hue2},28%,62%)"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#g)"/>
  <rect x="140" y="250" width="270" height="400" fill="hsla(30,20%,25%,0.35)"/>
  <rect x="500" y="210" width="320" height="440" fill="hsla(28,24%,20%,0.32)"/>
  <rect x="920" y="280" width="260" height="370" fill="hsla(35,18%,24%,0.28)"/>
</svg>`;
}

type ImagePayload = {
  bytes: ArrayBuffer;
  contentType: string;
};

async function fetchImageCandidate(target: string, timeoutMs: number): Promise<ImagePayload | null> {
  const upstream = await fetch(target, {
    headers: { Accept: "image/avif,image/webp,image/*,*/*;q=0.8" },
    signal: AbortSignal.timeout(timeoutMs),
  }).catch(() => null);
  if (!upstream?.ok) return null;
  const contentType = upstream.headers.get("content-type") ?? "";
  if (!contentType.startsWith("image/")) return null;
  // Read bytes before returning so abort timeouts can't break downstream piping.
  const bytes = await upstream.arrayBuffer().catch(() => null);
  if (!bytes) return null;
  return { bytes, contentType };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const c = searchParams.get("c") ?? "";
  const k = searchParams.get("k") ?? "";
  const i = parseInt(searchParams.get("i") ?? "0", 10);
  if (!COLLECTIONS.has(c) || !k || k.length > 220 || Number.isNaN(i) || i < 0 || i > 19) {
    return new NextResponse("Not found", { status: 404 });
  }
  const targets = resolvePhotoCandidates(c, k, i);
  const cacheControl = "public, max-age=86400, stale-while-revalidate=604800";

  // Fewer parallel upstream tries + shorter timeouts → faster fallback to SVG.
  const primaryBatch = targets.slice(0, 2);
  const firstValid = await Promise.any(
    primaryBatch.map(async (target) => {
      const response = await fetchImageCandidate(target, 1400);
      if (!response) {
        throw new Error("candidate_failed");
      }
      return response;
    }),
  ).catch(() => null);
  if (firstValid) {
    return new NextResponse(firstValid.bytes, {
      status: 200,
      headers: {
        "Content-Type": firstValid.contentType,
        "Cache-Control": cacheControl,
      },
    });
  }

  // Retry remaining candidates sequentially with tight timeout budget.
  for (const target of targets.slice(2)) {
    const upstream = await fetchImageCandidate(target, 1000);
    if (!upstream) continue;
    return new NextResponse(upstream.bytes, {
      status: 200,
      headers: {
        "Content-Type": upstream.contentType,
        "Cache-Control": cacheControl,
      },
    });
  }

  const svg = buildGeneratedSvg(c, k, i);
  return new NextResponse(svg, {
    status: 200,
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": cacheControl,
    },
  });
}
