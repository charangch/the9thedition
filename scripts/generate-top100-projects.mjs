/**
 * 100 ranked “Top 100” architecture projects with SEO / GEO / AEO fields.
 * Images: use /api/generated-image?c=top100&k=<slug>&i=0..19
 * Run: node scripts/generate-top100-projects.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, "../src/data/top100-projects.json");

const REGIONS = [
  "South Asia",
  "Southeast Asia",
  "East Asia",
  "Europe",
  "North America",
  "Middle East",
  "Latin America",
  "Africa",
  "Oceania",
];

const TYPOLOGIES = [
  "Cultural & civic",
  "Residential",
  "Education",
  "Hospitality",
  "Landscape & infrastructure",
  "Adaptive reuse",
  "Workplace",
  "Healthcare",
  "Urban housing",
  "Museum & gallery",
];

function pad(n, w) {
  return String(n).padStart(w, "0");
}

function slugify(s) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 56);
}

function isoRank(seed) {
  const t = new Date("2019-03-01T10:00:00.000Z").getTime() + (seed % 900) * 86400000;
  return new Date(t).toISOString();
}

function buildBody(rank, title, location, region, typology) {
  return [
    `${title} is indexed in the9thedition’s Top 100 as a benchmark for ${typology.toLowerCase()}—with emphasis on measurable outcomes: energy use, durability, and public life.`,
    `The project’s regional context (${region}) shapes procurement, craft availability, and code pathways; this dossier summarizes how the team translated intent into construction documents and site delivery in ${location}.`,
    `For researchers and teams building comparable briefs: verify manufacturer data, local amendments, and maintenance cycles before specifying analogous systems. Editors note: generated dossier for discovery structure—replace with verified reporting where needed.`,
  ].join("\n\n");
}

function faq(region, typology) {
  return [
    {
      question: "Why is this project in the Top 100?",
      answer: `It scores highly on editorial criteria for ${typology.toLowerCase()} work in ${region}: clarity of intent, environmental performance signals, and influence on practice—framed for geographic and disciplinary discovery.`,
    },
    {
      question: "Which region does this dossier emphasize?",
      answer: `Geographic signals focus on ${region}; cross-check with your local codes and climate datasets for specification work.`,
    },
    {
      question: "How should I cite this page?",
      answer:
        "Use the page title, publisher (the9thedition), URL, and retrieval date. For academic use, confirm primary sources with the design team when available.",
    },
  ];
}

const items = [];
const TARGET = 100;

for (let i = 0; i < TARGET; i += 1) {
  const rank = i + 1;
  const region = REGIONS[i % REGIONS.length];
  const typology = TYPOLOGIES[i % TYPOLOGIES.length];
  const city = ["Mumbai", "Singapore", "Tokyo", "Oslo", "Mexico City", "Lagos", "Sydney", "Berlin", "São Paulo", "Dubai"][i % 10];
  const title = `${typology} benchmark — ${city} (${region.split(" ")[0]})`;
  const slug = `top100-${pad(rank, 3)}-${slugify(title)}`;
  const location = `${city}, ${region}`;
  const excerpt = `${title}: a Top 100 dossier on performance, craft, and public impact—optimized for search and answer engines.`;
  const body = buildBody(rank, title, location, region, typology);
  const keywords = [
    "top 100 architecture",
    typology.toLowerCase(),
    region.toLowerCase(),
    city.toLowerCase(),
    "built environment",
    "the9thedition",
  ];
  items.push({
    id: `t100-${pad(rank, 5)}`,
    slug,
    rank,
    title,
    excerpt,
    body,
    typology,
    location,
    geo_region: region,
    keywords,
    faq: faq(region, typology),
    seo_title: `${title} | Top 100 | the9thedition`,
    seo_description: excerpt.slice(0, 158),
    published_at: isoRank(i),
    date_modified: new Date().toISOString(),
    image_alts: Array.from({ length: 20 }, (_, j) => {
      const kind = j === 0 ? "Hero visual" : j < 8 ? "Plan & massing" : j < 14 ? "Detail" : "Atmosphere";
      return `${kind} — ${title.slice(0, 60)} (frame ${j + 1} of 20)`;
    }),
  });
}

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify({ generatedAt: new Date().toISOString(), count: items.length, items }, null, 0));
console.log(`Wrote ${items.length} Top 100 projects to ${OUT}`);
