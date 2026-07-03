/**
 * Compress archive + articles JPEGs for GitHub/Vercel deploy (macOS sips).
 *   node scripts/compress-editorial-collection-images.mjs
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..", "public", "images");
const COLLECTIONS = ["archive", "articles"];
const MAX_WIDTH = 1600;
const QUALITY = 82;
const IMAGES_PER_ENTRY = 6;

async function compressDir(dir) {
  let count = 0;
  for (let i = 0; i < IMAGES_PER_ENTRY; i += 1) {
    const file = path.join(dir, `${i}.jpg`);
    try {
      await fs.access(file);
    } catch {
      continue;
    }
    execFileSync(
      "sips",
      ["-Z", String(MAX_WIDTH), "-s", "format", "jpeg", "-s", "formatOptions", String(QUALITY), file, "--out", file],
      { stdio: "ignore" },
    );
    count += 1;
  }
  return count;
}

async function main() {
  let total = 0;
  for (const collection of COLLECTIONS) {
    const base = path.join(ROOT, collection);
    const entries = await fs.readdir(base).catch(() => []);
    for (const slug of entries) {
      if (slug.endsWith(".json")) continue;
      const dir = path.join(base, slug);
      const stat = await fs.stat(dir).catch(() => null);
      if (!stat?.isDirectory()) continue;
      total += await compressDir(dir);
    }
    console.log(`Compressed ${collection} images.`);
  }
  console.log(`Done: ${total} editorial images (max width ${MAX_WIDTH}, quality ${QUALITY}).`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
