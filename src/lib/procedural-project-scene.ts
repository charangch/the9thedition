import { getAllProjectSlugs } from "@/lib/project-catalog";

const CATALOG_SLUGS = new Set(getAllProjectSlugs());

export function isCatalogProjectSlug(slug: string): boolean {
  return CATALOG_SLUGS.has(slug);
}

function hash(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function pick(seed: number, min: number, max: number): number {
  return min + (seed % (max - min + 1));
}

type ProjectIdentity = {
  hue: number;
  accentHue: number;
  skyLight: number;
  massCount: number;
  isInterior: boolean;
  volumes: { x: number; y: number; w: number; h: number; depth: number }[];
};

function buildIdentity(slug: string): ProjectIdentity {
  const seed = hash(slug);
  const hue = seed % 360;
  const accentHue = (hue + 28 + (seed % 40)) % 360;
  const skyLight = 68 + (seed % 14);
  const isInterior = /interior|apartment|palette|fluid/i.test(slug);
  const massCount = 3 + (seed % 3);

  const volumes: ProjectIdentity["volumes"] = [];
  let cursor = 120 + (seed % 80);
  for (let m = 0; m < massCount; m += 1) {
    const vs = hash(`${slug}|mass|${m}`);
    const w = pick(vs, 180, 340);
    const h = pick(vs >> 3, 220, 420);
    const y = pick(vs >> 5, 180, 320);
    volumes.push({ x: cursor, y, w, h, depth: pick(vs >> 7, 8, 28) });
    cursor += w + pick(vs >> 9, 24, 72);
  }

  return { hue, accentHue, skyLight, massCount, isInterior, volumes };
}

/** Copyright-free procedural architecture study — same building per slug, unique frame per index. */
export function buildProjectSceneSvg(slug: string, index: number): string {
  const id = buildIdentity(slug);
  const frame = hash(`${slug}|${index}`);
  const w = 1600;
  const h = 900;
  const view = index % 10;

  const skyTop = `hsl(${id.hue},22%,${id.skyLight}%)`;
  const skyBottom = `hsl(${id.accentHue},18%,${Math.max(42, id.skyLight - 18)}%)`;
  const ground = `hsl(${id.hue},12%,${Math.max(28, id.skyLight - 32)}%)`;
  const wall = `hsl(${id.hue},20%,${Math.max(36, id.skyLight - 24)}%)`;
  const wallShadow = `hsl(${id.hue},16%,${Math.max(28, id.skyLight - 34)}%)`;
  const accent = `hsl(${id.accentHue},26%,${Math.max(40, id.skyLight - 20)}%)`;
  const glass = `hsla(${id.accentHue},35%,72%,0.45)`;
  const foliage = `hsl(${(id.hue + 80) % 360},28%,38%)`;

  const panX = ((frame % 200) - 100) * (0.3 + (index % 5) * 0.08);
  const panY = ((frame >> 4) % 80) - 40;
  const scale = 0.82 + (index % 7) * 0.04;

  const volumesSvg = id.volumes
    .map((v, m) => {
      const vx = (v.x + panX) * scale;
      const vy = (v.y + panY) * scale;
      const vw = v.w * scale;
      const vh = v.h * scale;
      const winRows = 2 + ((frame + m) % 3);
      const winCols = 2 + ((frame >> 2) + m) % 4;
      const windows: string[] = [];
      if (!id.isInterior || view >= 5) {
        for (let r = 0; r < winRows; r += 1) {
          for (let c = 0; c < winCols; c += 1) {
            const wx = vx + 18 + c * (vw / (winCols + 1));
            const wy = vy + 24 + r * (vh / (winRows + 1.5));
            const ww = Math.min(36, vw / (winCols + 2));
            const wh = Math.min(52, vh / (winRows + 2.5));
            windows.push(
              `<rect x="${wx.toFixed(1)}" y="${wy.toFixed(1)}" width="${ww.toFixed(1)}" height="${wh.toFixed(1)}" rx="2" fill="${glass}"/>`,
            );
          }
        }
      }
      return `<g>
        <rect x="${vx.toFixed(1)}" y="${(vy + v.depth).toFixed(1)}" width="${vw.toFixed(1)}" height="${vh.toFixed(1)}" fill="${wallShadow}" opacity="0.55"/>
        <rect x="${vx.toFixed(1)}" y="${vy.toFixed(1)}" width="${vw.toFixed(1)}" height="${vh.toFixed(1)}" fill="${wall}" rx="2"/>
        ${windows.join("")}
        <rect x="${vx.toFixed(1)}" y="${vy.toFixed(1)}" width="${vw.toFixed(1)}" height="${Math.min(14, vh * 0.04).toFixed(1)}" fill="${accent}" opacity="0.7"/>
      </g>`;
    })
    .join("");

  const trees = Array.from({ length: 3 + (frame % 4) }, (_, t) => {
    const tx = 80 + t * (220 + (frame % 60)) + panX * 0.5;
    const ty = 620 + ((frame >> (t + 1)) % 40);
    const tr = 28 + ((frame + t * 7) % 22);
    return `<circle cx="${tx.toFixed(1)}" cy="${ty.toFixed(1)}" r="${tr}" fill="${foliage}" opacity="0.85"/>`;
  }).join("");

  const interiorLayer =
    id.isInterior || view >= 6
      ? `<rect x="0" y="520" width="${w}" height="${h - 520}" fill="${ground}" opacity="0.35"/>
         <rect x="${(200 + panX).toFixed(1)}" y="${(540 + panY).toFixed(1)}" width="${(900 * scale).toFixed(1)}" height="12" fill="${accent}" opacity="0.5"/>
         <rect x="${(260 + panX).toFixed(1)}" y="${(580 + panY).toFixed(1)}" width="${(120 * scale).toFixed(1)}" height="${(180 * scale).toFixed(1)}" fill="${wallShadow}" opacity="0.4" rx="4"/>`
      : "";

  const crop =
    view < 3
      ? ""
      : view < 6
        ? `<clipPath id="crop"><rect x="${(100 + index * 12).toFixed(0)}" y="${(80 + index * 8).toFixed(0)}" width="${(1200 - index * 20).toFixed(0)}" height="${(680 - index * 10).toFixed(0)}"/></clipPath>`
        : "";

  const sunX = 1180 + (frame % 120) - 60;
  const sunY = 90 + ((frame >> 3) % 80);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-hidden="true">
  <defs>
    <linearGradient id="sky" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${skyTop}"/>
      <stop offset="100%" stop-color="${skyBottom}"/>
    </linearGradient>
    ${crop}
  </defs>
  <rect width="100%" height="100%" fill="url(#sky)"/>
  <circle cx="${sunX}" cy="${sunY}" r="42" fill="hsla(48,80%,88%,0.55)"/>
  <rect x="0" y="600" width="${w}" height="${h - 600}" fill="${ground}"/>
  ${trees}
  <g ${crop ? 'clip-path="url(#crop)"' : ""}>
    ${volumesSvg}
    ${interiorLayer}
  </g>
  <rect x="0" y="0" width="${w}" height="${h}" fill="hsla(${id.hue},10%,12%,${(0.04 + (index % 6) * 0.012).toFixed(3)})"/>
</svg>`;
}
