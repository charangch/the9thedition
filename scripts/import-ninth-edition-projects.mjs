/**
 * Import 20 projects from ~/Downloads/TheNinthEdition/{1..20}
 *   node scripts/import-ninth-edition-projects.mjs
 *
 * Copies images to public/images/projects/{slug}/ and writes src/data/ninth-edition-projects.json
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SOURCE_ROOT = path.resolve(process.env.NINTH_EDITION_SOURCE ?? "/Users/gurucharan/Downloads/TheNinthEdition");
const OUT_JSON = path.join(ROOT, "src/data/ninth-edition-projects.json");
const OUT_IMAGES = path.join(ROOT, "public/images/projects");
const FOLDER_COUNT = 20;
const IMAGES_PER_PROJECT = 5;

function slugify(title) {
  return title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function readDocxText(docxPath) {
  return execFileSync("textutil", ["-convert", "txt", "-stdout", docxPath], { encoding: "utf8" });
}

function field(text, label) {
  const re = new RegExp(`^${label}\\s+(.+)$`, "im");
  const m = text.match(re);
  return m?.[1]?.trim() ?? "";
}

function section(text, name) {
  const re = new RegExp(`${name}\\s*\\n([\\s\\S]*?)(?=\\n[A-Z][A-Z \\&]+\\n|$)`, "i");
  const m = text.match(re);
  return m?.[1]?.trim() ?? "";
}

function parseProject(text, folderNum) {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.replace(/\u2028/g, " ").trim())
    .filter(Boolean);

  const title = lines[0] ?? `Project ${folderNum}`;
  const dek = lines[1] ?? "";
  const category = field(text, "CATEGORY") || "Architecture & Design";
  const location = field(text, "LOCATION") || "";
  const projectType = field(text, "PROJECT TYPE") || "Residential";
  const area = field(text, "AREA") || "";
  const year = field(text, "YEAR") || "";
  const architects = field(text, "ARCHITECTS") || "";
  const lead = field(text, "LEAD") || "";
  const manufacturers = field(text, "MANUFACTURERS") || "";
  const climateStrategy = field(text, "CLIMATE STRATEGY") || "";
  const primaryMaterials = field(text, "PRIMARY MATERIALS") || "";

  const intro = section(text, "PROJECT INTRODUCTION");
  const about = section(text, "ABOUT THE PROJECT");

  const paragraphs = [];
  if (intro) paragraphs.push(intro);
  if (about) {
    about
      .split(/\n\n+/)
      .map((p) => p.trim())
      .filter(Boolean)
      .forEach((p) => paragraphs.push(p));
  }

  const slug = slugify(title);
  const excerpt = dek || intro || paragraphs[0]?.slice(0, 220) || title;

  const specs = [
    { label: "Category", value: category },
    location ? { label: "Location", value: location } : null,
    projectType ? { label: "Project type", value: projectType } : null,
    area ? { label: "Area", value: area } : null,
    year ? { label: "Year", value: year } : null,
    architects ? { label: "Architects", value: architects } : null,
    lead ? { label: "Lead", value: lead } : null,
    manufacturers ? { label: "Manufacturers", value: manufacturers } : null,
    climateStrategy ? { label: "Climate strategy", value: climateStrategy } : null,
    primaryMaterials ? { label: "Primary materials", value: primaryMaterials } : null,
  ].filter(Boolean);

  const geoRegion = location.includes(",") ? location.split(",").slice(-1)[0]?.trim() ?? location : location;

  return {
    id: folderNum,
    slug,
    title,
    dek,
    excerpt,
    category,
    location,
    projectType,
    architects,
    lead,
    byline: architects ? `By ${architects}` : "By Editorial Desk",
    paragraphs,
    specs,
    seo: {
      title: `${title} | ${location || "Projects"} | Projects | the9thedition`,
      description: dek || excerpt,
      keywords: [title, architects, location, projectType, category, "the9thedition", "luxury architecture"].filter(Boolean),
      geo_region: geoRegion || "International",
    },
    imageAlts: Array.from({ length: IMAGES_PER_PROJECT }, (_, i) =>
      i === 0 ? `${title} — exterior` : `${title} — view ${i + 1}`,
    ),
  };
}

async function convertToJpg(src, dest) {
  execFileSync("sips", ["-s", "format", "jpeg", "-s", "formatOptions", "85", src, "--out", dest], {
    stdio: "ignore",
  });
}

async function importImages(folderNum, slug) {
  const srcDir = path.join(SOURCE_ROOT, String(folderNum));
  const destDir = path.join(OUT_IMAGES, slug);
  await fs.mkdir(destDir, { recursive: true });

  for (let i = 0; i < IMAGES_PER_PROJECT; i += 1) {
    const src = path.join(srcDir, `Theninthedition${i + 1}.png`);
    const dest = path.join(destDir, `${i}.jpg`);
    try {
      await fs.access(src);
    } catch {
      throw new Error(`Missing ${src}`);
    }
    await convertToJpg(src, dest);
  }
}

async function main() {
  const projects = [];
  const slugs = new Set();

  for (let folder = 1; folder <= FOLDER_COUNT; folder += 1) {
    const dir = path.join(SOURCE_ROOT, String(folder));
    const files = await fs.readdir(dir);
    const docx = files.find((f) => f.toLowerCase().endsWith(".docx"));
    if (!docx) throw new Error(`No .docx in folder ${folder}`);

    const text = readDocxText(path.join(dir, docx));
    const project = parseProject(text, folder);
    if (slugs.has(project.slug)) {
      project.slug = `${project.slug}-${folder}`;
    }
    slugs.add(project.slug);

    await importImages(folder, project.slug);
    projects.push(project);
    console.log(`✓ ${folder} → ${project.slug} (${project.title})`);
  }

  await fs.writeFile(
    OUT_JSON,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        source: SOURCE_ROOT,
        imagesPerProject: IMAGES_PER_PROJECT,
        count: projects.length,
        projects,
      },
      null,
      2,
    ),
  );

  console.log(`\nImported ${projects.length} projects → ${OUT_JSON}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
