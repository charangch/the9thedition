/**
 * Downloads 7 unique real architecture photos per catalog project into public/images/projects/.
 * Primary pool: curated Unsplash architecture/interiors (Unsplash License).
 * Top-up: Picsum real photographs (also Unsplash-sourced, free to use).
 *
 *   node scripts/fetch-catalog-project-images.mjs
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT_DIR = path.join(ROOT, "public", "images", "projects");

const SLUGS = [
  "hyderabad-climate-smart-residence",
  "kochi-courtyard-craft-memory",
  "interiors-texture-light-silence",
  "alibag-nine-courtyards",
  "kottayam-sun-shade-vernacular",
  "bengaluru-mexican-palette-brutalism",
  "designer-directory-hospitality-interiors",
  "thrissur-forest-bungalow-mango",
  "pawna-weekend-rustic-stone",
  "jaipur-haveli-modern-life",
  "khar-west-fluid-interiors",
  "chennai-coastal-villa-verandahs",
  "rajapalayam-farmhouse-generations",
  "birdhouses-kutch-community-towers",
  "courtyards-tropical-luxury-homes",
  "celebrity-homes-art-decisions",
  "temple-architecture-modern-gallery",
  "portrait-artist-studios",
  "biennale-cities-design-destinations",
];

/** Curated architecture / interior Unsplash bases (deduped below). */
const ARCHITECTURE_UNSPLASH = [
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
  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6",
  "https://images.unsplash.com/photo-1600047509359-cacb95f69f84",
  "https://images.unsplash.com/photo-1600607687126-8a3414349a51",
  "https://images.unsplash.com/photo-1600585154526-990dced4db0d",
  "https://images.unsplash.com/photo-1600210491369-e753d80a41f3",
  "https://images.unsplash.com/photo-1600573472591-ee6b68d14c68",
  "https://images.unsplash.com/photo-1600047509358-9dc75507daeb",
  "https://images.unsplash.com/photo-1600047509782-20d39509f26d",
  "https://images.unsplash.com/photo-1493666438817-866a91353ca9",
  "https://images.unsplash.com/photo-1505691938895-1758d7feb511",
  "https://images.unsplash.com/photo-1503602642458-232111445657",
  "https://images.unsplash.com/photo-1555041469-a586c61ea9bc",
  "https://images.unsplash.com/photo-1556912167-f556f1f39fdf",
  "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136",
  "https://images.unsplash.com/photo-1538688525198-9b88f6f53126",
  "https://images.unsplash.com/photo-1582582621959-48d27397dc69",
  "https://images.unsplash.com/photo-1581539250439-c96689b516dd",
  "https://images.unsplash.com/photo-1617104551722-3b2d51366468",
  "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85",
  "https://images.unsplash.com/photo-1554995207-c18c203602cb",
  "https://images.unsplash.com/photo-1487958449943-2429e8be8625",
  "https://images.unsplash.com/photo-1560518883-ce09059eeffa",
  "https://images.unsplash.com/photo-1479834812679-4642b6f3fd62",
  "https://images.unsplash.com/photo-1545324418-6591a0eb3b48",
  "https://images.unsplash.com/photo-1523212462562-432d6ba3a6d0",
  "https://images.unsplash.com/photo-1600566752355-35792bedcfea",
  "https://images.unsplash.com/photo-1616486029423-aaa4789e8c9a",
  "https://images.unsplash.com/photo-1489515217757-5fd1be406fef",
  "https://images.unsplash.com/photo-1524492412937-b28074a5d7da",
  "https://images.unsplash.com/photo-1513364776144-60967b0f800f",
  "https://images.unsplash.com/photo-1518998053901-5348d3961a04",
  "https://images.unsplash.com/photo-1518780664697-55e3ad006588",
  "https://images.unsplash.com/photo-1449844908441-8829872d2607",
  "https://images.unsplash.com/photo-1501183638710-841dd1904471",
  "https://images.unsplash.com/photo-1568605114967-8130f3a36994",
  "https://images.unsplash.com/photo-1600585152915-d208bec867a1",
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9",
  "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6",
];

const IMAGES_PER_PROJECT = 7;
const needed = SLUGS.length * IMAGES_PER_PROJECT;

function dedupe(urls) {
  const out = [];
  const seen = new Set();
  for (const u of urls) {
    const base = u.split("?")[0];
    if (seen.has(base)) continue;
    seen.add(base);
    out.push(base);
  }
  return out;
}

async function fetchPicsumUrls(count) {
  const out = [];
  for (let page = 1; out.length < count && page <= 8; page += 1) {
    const res = await fetch(`https://picsum.photos/v2/list?limit=30&page=${page}`);
    const data = await res.json();
    for (const item of data) {
      out.push(`https://picsum.photos/id/${item.id}/1600/900.jpg`);
      if (out.length >= count) break;
    }
  }
  return out;
}

function unsplashDownloadUrl(base) {
  const u = new URL(base);
  u.searchParams.set("auto", "format");
  u.searchParams.set("fit", "crop");
  u.searchParams.set("w", "1600");
  u.searchParams.set("h", "900");
  u.searchParams.set("q", "82");
  u.searchParams.set("fm", "jpg");
  return u.toString();
}

async function downloadOne(url, dest) {
  const fetchUrl = url.includes("unsplash.com") ? unsplashDownloadUrl(url) : url;
  const res = await fetch(fetchUrl, {
    headers: { Accept: "image/jpeg,image/*" },
    signal: AbortSignal.timeout(45000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await fs.writeFile(dest, buf);
}

async function main() {
  const arch = dedupe(ARCHITECTURE_UNSPLASH);
  const extra = await fetchPicsumUrls(Math.max(0, needed - arch.length + 20));
  const pool = dedupe([...arch, ...extra]);
  if (pool.length < needed) {
    throw new Error(`Need ${needed} unique sources, got ${pool.length}`);
  }

  const manifest = {};
  let poolIndex = 0;

  async function nextSource() {
    while (poolIndex < pool.length) {
      const src = pool[poolIndex++];
      if (src) return src;
    }
    throw new Error("Ran out of image sources");
  }

  for (const slug of SLUGS) {
    const dir = path.join(OUT_DIR, slug);
    await fs.mkdir(dir, { recursive: true });
    const sources = [];
    for (let i = 0; i < IMAGES_PER_PROJECT; i += 1) {
      let saved = false;
      while (!saved) {
        const src = await nextSource();
        const dest = path.join(dir, `${i}.jpg`);
        process.stdout.write(`↓ ${slug}/${i}.jpg … `);
        try {
          await downloadOne(src, dest);
          sources.push(src);
          console.log("ok");
          saved = true;
        } catch (err) {
          console.log("skip:", err.message);
        }
      }
    }
    manifest[slug] = sources;
  }

  await fs.writeFile(
    path.join(OUT_DIR, "manifest.json"),
    JSON.stringify(
      { generatedAt: new Date().toISOString(), imagesPerProject: IMAGES_PER_PROJECT, projects: manifest },
      null,
      2,
    ),
  );
  console.log(`\nDone — ${SLUGS.length} projects × ${IMAGES_PER_PROJECT} = ${needed} images in ${OUT_DIR}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
