/**
 * Download 6 luxury architecture photos per archive + articles slug (one building set each).
 *   node scripts/fetch-editorial-collection-images.mjs
 *   node scripts/fetch-editorial-collection-images.mjs --collection=archive
 *   node scripts/fetch-editorial-collection-images.mjs --limit=20
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildingSetForSlug } from "./luxury-building-sets.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const IMAGES_PER_ENTRY = 6;

const collectionArg = process.argv.find((a) => a.startsWith("--collection="))?.split("=")[1];
const limitArg = parseInt(process.argv.find((a) => a.startsWith("--limit="))?.split("=")[1] ?? "0", 10);

function unsplashDownloadUrl(url) {
  if (url.includes("fp-x=") || url.includes("w=")) return url;
  const u = new URL(url.split("?")[0]);
  u.searchParams.set("auto", "format");
  u.searchParams.set("fit", "crop");
  u.searchParams.set("w", "1600");
  u.searchParams.set("h", "900");
  u.searchParams.set("q", "82");
  u.searchParams.set("fm", "jpg");
  return u.toString();
}

async function downloadOne(url, dest) {
  const res = await fetch(unsplashDownloadUrl(url), {
    headers: { Accept: "image/jpeg,image/*" },
    signal: AbortSignal.timeout(60000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  await fs.writeFile(dest, Buffer.from(await res.arrayBuffer()));
}

async function loadSlugs(collection) {
  const file =
    collection === "archive"
      ? path.join(ROOT, "src/data/archive-projects.json")
      : path.join(ROOT, "src/data/editorial-articles.json");
  const data = JSON.parse(await fs.readFile(file, "utf8"));
  return data.items.map((item) => item.slug);
}

async function processCollection(collection) {
  const slugs = await loadSlugs(collection);
  const limited = limitArg > 0 ? slugs.slice(0, limitArg) : slugs;
  const outRoot = path.join(ROOT, "public", "images", collection);
  const manifest = {};

  for (const slug of limited) {
    const dir = path.join(outRoot, slug);
    await fs.mkdir(dir, { recursive: true });
    const sources = buildingSetForSlug(slug);
    const saved = [];
    for (let i = 0; i < IMAGES_PER_ENTRY; i += 1) {
      const src = sources[i % sources.length];
      const dest = path.join(dir, `${i}.jpg`);
      process.stdout.write(`↓ ${collection}/${slug}/${i}.jpg … `);
      try {
        await downloadOne(src, dest);
        saved.push(src);
        console.log("ok");
      } catch (err) {
        console.log("skip:", err.message);
      }
    }
    manifest[slug] = saved;
  }

  await fs.writeFile(
    path.join(outRoot, "manifest.json"),
    JSON.stringify(
      { generatedAt: new Date().toISOString(), imagesPerEntry: IMAGES_PER_ENTRY, entries: manifest },
      null,
      2,
    ),
  );
  console.log(`\n${collection}: ${limited.length} entries × ${IMAGES_PER_ENTRY} images → ${outRoot}`);
}

async function main() {
  const collections = collectionArg ? [collectionArg] : ["archive", "articles"];
  for (const collection of collections) {
    await processCollection(collection);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
