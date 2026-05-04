/**
 * 500 long-form editorial articles (architects, houses, products).
 * Images are NOT stored here — use /api/generated-image (see src/lib/generated-media.ts).
 * Optional Gemini batch: scripts/generate-gemini-images.mjs (requires API key + quota).
 * Run: node scripts/generate-editorial-articles.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, "../src/data/editorial-articles.json");

const CATS = /** @type {const} */ (["Architects", "Houses", "Products"]);

const REGIONS = [
  "South Asia",
  "Southeast Asia",
  "Europe",
  "North America",
  "Middle East",
  "Latin America",
  "East Asia",
  "Oceania",
  "Africa",
];

function pad(n, w) {
  return String(n).padStart(w, "0");
}

function slugify(s) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 72);
}

function iso(seed) {
  const t = new Date("2018-01-10T09:00:00.000Z").getTime() + (seed % 2000) * 86400000;
  return new Date(t).toISOString();
}

function buildTitle(i, cat) {
  const themes = [
    "courtyard ventilation",
    "limestone massing",
    "timber grids",
    "ceramic rainscreen",
    "BIM coordination",
    "modular bathrooms",
    "passive cooling",
    "heritage retrofit",
    "facade maintenance",
    "acoustic comfort",
  ];
  const th = themes[i % themes.length];
  if (cat === "Architects") {
    return `How ${th} became a studio signature in contemporary practice`;
  }
  if (cat === "Houses") {
    return `Premium homes: ${th} and family-scale comfort in warm climates`;
  }
  return `Specification notes: ${th} across façade and interior product lines`;
}

function buildBody(title, cat) {
  const p1 = `${title} is part of the9thedition’s editorial series connecting design intent, procurement, and long-term performance. We focus on decisions that repeat across commissions: materials, systems, and the way teams document intent for clients and contractors.`;

  const p2 =
    cat === "Architects"
      ? `For practices, the article traces how design leadership translates into repeatable details—specification discipline, mock-ups, and site observation—without flattening authorship.`
      : cat === "Houses"
        ? `For residential projects, the emphasis is on livability: daylight, shading, thermal comfort, and acoustic separation—balanced with craft budgets and maintenance realism.`
        : `For product selections, we compare performance claims with installation realities, maintenance cycles, and regional availability—so teams can shortlist responsibly.`;

  const p3 = `Each section includes references to measurement, not just mood: what to verify in submittals, what to test during commissioning, and what to document for future renovation cycles.`;

  const p4 = `Editors note: this file is generated for discovery and SEO structure; replace with commissioned reporting where proprietary details apply.`;

  return [p1, p2, p3, p4].join("\n\n");
}

function altsFor(title) {
  const base = title.slice(0, 80);
  return Array.from({ length: 20 }, (_, j) => {
    const kind = j === 0 ? "Hero visual" : j < 6 ? "Detail" : j < 12 ? "Diagrammatic" : "Atmosphere";
    return `${kind} — ${base} (frame ${j + 1} of 20)`;
  });
}

function faq(cat) {
  return [
    {
      question: `What is this ${cat.toLowerCase()} article about?`,
      answer: `It explains recurring design and delivery decisions, with emphasis on verification, documentation, and regional context.`,
    },
    {
      question: "Who is the intended reader?",
      answer: "Architects, interior designers, developers, and students who need structured narratives for search and citation.",
    },
    {
      question: "Are images photographs of a real site?",
      answer: "Gallery frames are deterministic on-site graphics generated for layout and SEO—not stock photography. Replace with project media when available.",
    },
  ];
}

const items = [];
const TARGET = 500;

for (let i = 0; i < TARGET; i++) {
  const cat = CATS[i % CATS.length];
  const title = buildTitle(i, cat);
  const slug = `ed-${slugify(title)}-${pad(i + 1, 4)}`;
  const excerpt = `${title.slice(0, 120)}… A structured editorial brief with build details, product notes, and geographic context.`;
  const body = buildBody(title, cat);
  const region = REGIONS[i % REGIONS.length];
  const focus =
    cat === "Architects"
      ? "Independent architecture studios"
      : cat === "Houses"
        ? "Contemporary residential commissions"
        : "Building product manufacturers";

  items.push({
    id: `ed-${pad(i + 1, 5)}`,
    slug,
    title,
    excerpt,
    body,
    category: cat,
    focus_entity: focus,
    image_alts: altsFor(title),
    keywords: [
      cat.toLowerCase(),
      "architecture",
      "design",
      "construction",
      "built environment",
      region.toLowerCase(),
      "the9thedition",
    ],
    faq: faq(cat),
    geo_region: region,
    seo_title: `${title} | Articles | the9thedition`,
    seo_description: excerpt.slice(0, 158),
    published_at: iso(i),
    date_modified: new Date().toISOString(),
  });
}

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify({ generatedAt: new Date().toISOString(), count: items.length, items }, null, 0));

console.log(`Wrote ${items.length} editorial articles to ${OUT}`);
