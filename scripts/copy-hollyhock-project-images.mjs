/**
 * Copy real Hollyhock architectural photography into catalog project image slots.
 * Each catalog slug gets 7 images from one Hollyhock project folder (same building).
 *
 *   node scripts/copy-hollyhock-project-images.mjs
 */
import fs from "node:fs/promises";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

const execFileAsync = promisify(execFile);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const HOLLYHOCK_ROOT = "/Users/gurucharan/Downloads/projects hollyhock";
const OUT_DIR = path.join(ROOT, "public", "images", "projects");

const CATALOG_SLUGS = [
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

/** One Hollyhock project folder per catalog entry (same building across all 7 frames). */
const HOLLYHOCK_FOLDER_BY_SLUG = {
  "hyderabad-climate-smart-residence": "20 Seymour Gr Brighton",
  "kochi-courtyard-craft-memory": "31 Seymour Gr Brighton",
  "interiors-texture-light-silence": "Gwendoline Avenue Bentleigh",
  "alibag-nine-courtyards": "Kenneth St Sandringham",
  "kottayam-sun-shade-vernacular": "Norman Mckinnon",
  "bengaluru-mexican-palette-brutalism": "Smith St Bentleigh",
  "designer-directory-hospitality-interiors": "Gallaghers Glen Waverley",
  "thrissur-forest-bungalow-mango": "19B Vunabere Avenue",
  "pawna-weekend-rustic-stone": "6 Filbert Street, Bentleigh East",
  "jaipur-haveli-modern-life": "Beths St Bentleigh",
  "khar-west-fluid-interiors": "Ruby st Ormond",
  "chennai-coastal-villa-verandahs": "Mountview Highett",
  "rajapalayam-farmhouse-generations": "20 Seymour Gr Brighton",
  "birdhouses-kutch-community-towers": "31 Seymour Gr Brighton",
  "courtyards-tropical-luxury-homes": "Gwendoline Avenue Bentleigh",
  "celebrity-homes-art-decisions": "Norman Mckinnon",
  "temple-architecture-modern-gallery": "Smith St Bentleigh",
  "portrait-artist-studios": "Gallaghers Glen Waverley",
  "biennale-cities-design-destinations": "19B Vunabere Avenue",
};

const IMAGE_PER_PROJECT = 7;
const IMAGE_EXT = /\.(jpe?g|png|webp)$/i;

function buildingPriority(name) {
  const n = name.toLowerCase();
  if (/facade|facacde|rear|front|exterior|street|entry|outdoor|garden|crop|_001|_002|image[2-9]/.test(n)) return 0;
  if (/living|kitchen|dining|family|master|ensuite|bedroom|bath|interior|premium|original/.test(n)) return 2;
  return 1;
}

async function listImages(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  return entries
    .filter((e) => e.isFile() && IMAGE_EXT.test(e.name))
    .map((e) => path.join(dir, e.name))
    .sort((a, b) => {
      const pa = buildingPriority(path.basename(a));
      const pb = buildingPriority(path.basename(b));
      if (pa !== pb) return pa - pb;
      return path.basename(a).localeCompare(path.basename(b));
    });
}

async function toJpeg(src, dest) {
  const ext = path.extname(src).toLowerCase();
  if (ext === ".jpg" || ext === ".jpeg") {
    await fs.copyFile(src, dest);
    return;
  }
  try {
    await execFileAsync("sips", ["-s", "format", "jpeg", src, "--out", dest]);
  } catch {
    await fs.copyFile(src, dest);
  }
}

async function pickSeven(folderPath, slugIndex) {
  const all = await listImages(folderPath);
  const exteriors = all.filter((f) => buildingPriority(path.basename(f)) <= 1);
  const pool = exteriors.length >= IMAGE_PER_PROJECT ? exteriors : all;
  if (pool.length < IMAGE_PER_PROJECT) {
    throw new Error(`Not enough images in ${folderPath} (${pool.length})`);
  }
  const offset = (slugIndex % Math.max(1, Math.floor(pool.length / IMAGE_PER_PROJECT))) * IMAGE_PER_PROJECT;
  const slice = [];
  for (let i = 0; i < IMAGE_PER_PROJECT; i += 1) {
    slice.push(pool[(offset + i) % pool.length]);
  }
  return slice;
}

async function main() {
  const manifest = { generatedAt: new Date().toISOString(), source: HOLLYHOCK_ROOT, imagesPerProject: IMAGE_PER_PROJECT, projects: {} };
  const folderUseCount = new Map();

  for (let i = 0; i < CATALOG_SLUGS.length; i += 1) {
    const slug = CATALOG_SLUGS[i];
    const folderName = HOLLYHOCK_FOLDER_BY_SLUG[slug];
    if (!folderName) throw new Error(`No Hollyhock folder mapped for ${slug}`);

    const folderPath = path.join(HOLLYHOCK_ROOT, folderName);
    const useIdx = folderUseCount.get(folderName) ?? 0;
    folderUseCount.set(folderName, useIdx + 1);

    const picks = await pickSeven(folderPath, useIdx);
    const outSlugDir = path.join(OUT_DIR, slug);
    await fs.mkdir(outSlugDir, { recursive: true });

    const copied = [];
    for (let j = 0; j < picks.length; j += 1) {
      const dest = path.join(outSlugDir, `${j}.jpg`);
      process.stdout.write(`→ ${slug}/${j}.jpg ← ${path.basename(picks[j])} … `);
      await toJpeg(picks[j], dest);
      copied.push({ file: path.basename(picks[j]), hollyhockProject: folderName });
      console.log("ok");
    }
    manifest.projects[slug] = copied;
  }

  await fs.writeFile(path.join(OUT_DIR, "manifest.json"), JSON.stringify(manifest, null, 2));
  console.log(`\nDone — ${CATALOG_SLUGS.length} projects updated with Hollyhock building photography.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
