/**
 * Compress catalog project JPEGs for GitHub/Vercel deploy (macOS sips).
 *   node scripts/compress-catalog-images.mjs
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..", "public", "images", "projects");

const MAX_WIDTH = 1600;
const QUALITY = 82;

async function main() {
  const slugs = await fs.readdir(ROOT);
  let count = 0;
  for (const slug of slugs) {
    if (slug.endsWith(".json")) continue;
    const dir = path.join(ROOT, slug);
    const stat = await fs.stat(dir).catch(() => null);
    if (!stat?.isDirectory()) continue;
    for (let i = 0; i < 7; i++) {
      const file = path.join(dir, `${i}.jpg`);
      try {
        await fs.access(file);
      } catch {
        continue;
      }
      execFileSync("sips", ["-Z", String(MAX_WIDTH), "-s", "format", "jpeg", "-s", "formatOptions", String(QUALITY), file, "--out", file], {
        stdio: "ignore",
      });
      count += 1;
    }
  }
  console.log(`Compressed ${count} catalog images (max width ${MAX_WIDTH}, quality ${QUALITY}).`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
