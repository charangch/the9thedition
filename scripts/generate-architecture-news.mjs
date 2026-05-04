/**
 * Generates src/data/architecture-news.json with 400+ architecture news items.
 * Run: node scripts/generate-architecture-news.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, "../src/data/architecture-news.json");

const CATEGORIES = [
  "Sustainability",
  "Urban Development",
  "Materials & Construction",
  "Digital Technology & BIM",
  "Cultural Architecture",
  "Residential Architecture",
  "Public & Civic Architecture",
  "Landscape & Urbanism",
  "Interior Design",
  "Infrastructure",
  "Policy & Regulation",
  "Awards & Competitions",
];

const REGIONS = [
  "South Asia",
  "Southeast Asia",
  "East Asia",
  "Middle East",
  "Europe",
  "North America",
  "Latin America",
  "Africa",
  "Oceania",
  "Global",
];

const UNSPLASH = [
  "1487958449943-2429e8be8625",
  "1503387762-592deb58ef4e",
  "1518005020951-e994396cc6cb",
  "1545324418-6591a0eb3b48",
  "1464938050520-90341a78b87f",
  "1497366213518-e37544c8c1fe",
  "1511818964982-8ebbf3b14c6a",
  "1479834812679-4642b6f3fd62",
  "1486328202029-012512dd48e5",
  "1505843511967-2bb02dc79c48",
  "1580587771525-4bfcad0a31c8",
  "1560518883-ce09059eeffa",
  "1600607687939-ce8a6c25118c",
  "1600607687644-aac4c3ba33cf",
  "1600566752355-357f3e3a5b57",
  "1600585154340-be6161a56a0c",
  "1523212462562-432d6ba3a6d0",
  "1448639908741-0c3f3a2b2a3e",
  "1512917774080-9991f1c4c750",
  "1600585154080-4e5fa7e06534",
];

const SUBJECTS = [
  "mass timber",
  "cross-laminated timber",
  "low-carbon concrete",
  "recycled steel systems",
  "passive house envelopes",
  "biophilic facades",
  "adaptive reuse",
  "transit-oriented development",
  "waterfront urbanism",
  "modular construction",
  "prefabrication",
  "robotic fabrication",
  "digital twins",
  "generative design",
  "daylight optimization",
  "acoustic performance",
  "flood-resilient design",
  "heat-island mitigation",
  "circular material flows",
  "embodied carbon accounting",
];

const ACTORS = [
  "leading practices",
  "public agencies",
  "developer consortiums",
  "university research labs",
  "fabrication partners",
  "cities and regional authorities",
  "international design competitions",
  "heritage boards",
];

function slugify(s) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 72);
}

function pick(arr, i) {
  return arr[i % arr.length];
}

function pad(n, w) {
  return String(n).padStart(w, "0");
}

function isoDate(seed) {
  const start = new Date("2024-01-05T08:00:00.000Z").getTime();
  const dayMs = 86400000;
  const t = new Date(start + (seed % 500) * dayMs + (seed * 17) % dayMs);
  return t.toISOString();
}

function buildTitle(i) {
  const s = pick(SUBJECTS, i * 7);
  const cat = pick(CATEGORIES, i * 3);
  const templates = [
    `${cat.charAt(0)}${cat.slice(1)} Spotlight: How ${s} Is Reshaping Project Delivery in ${pick(REGIONS, i)}`,
    `New Research Links ${s} to Faster Approvals for Civic Architecture`,
    `Architects Report Gains in ${s} After Updated Benchmark Guidance`,
    `Why ${pick(ACTORS, i)} Are Prioritizing ${s} in 2026 Briefs`,
    `Case Study: ${s} and High-Performance Envelopes in ${pick(REGIONS, i + 1)}`,
    `Industry Brief: ${s} Moves From Pilot to Standard Workflow`,
    `Design Review: ${s} as a Lever for Lower Lifecycle Carbon`,
    `Construction Outlook: ${s} and Safer Sites on Complex Urban Projects`,
    `From Policy to Practice: ${s} in Housing and Mixed-Use Schemes`,
    `Studio Notes: Coordinating ${s} with MEP and Façade Engineering`,
  ];
  return templates[i % templates.length];
}

function buildExcerpt(title, i) {
  return `${title.split(":")[0] || "This update"} — ${pick(SUBJECTS, i + 2)} continues to influence briefing, documentation, and stakeholder alignment across architecture and construction teams. Editors summarize implications for schedules, specifications, and coordination.`;
}

function buildBody(title, category, region, i) {
  const p1 = `${title} reflects a wider shift in how architecture, engineering, and construction teams align on performance, documentation, and risk. Practitioners in ${region} note that early-stage decisions—especially around envelope strategy, systems coordination, and material selection—now carry stronger lifecycle implications than in prior cycles.`;

  const p2 = `According to industry interviews summarized for the9thedition, firms are tightening handoffs between concept design, technical design, and construction administration. The category “${category}” remains a useful editorial lens because it bundles the policy drivers, client expectations, and supplier capabilities that determine whether innovative approaches scale beyond one-off demonstrations.`;

  const p3 = `For readers researching procurement, specifications, and delivery models, the takeaway is consistent: treat ${pick(SUBJECTS, i + 5)} as a system decision, not a single trade choice. Teams that integrate commissioning intent, measurement, and post-occupancy feedback are seeing fewer surprises during site works and stronger alignment with climate and comfort targets.`;

  const p4 = `Looking ahead, editors will continue tracking standards updates, exemplar projects, and manufacturer roadmaps connected to this theme. If you are briefing a related project, cross-check local code adaptations, fire and acoustic requirements, and maintenance assumptions before finalizing details.`;

  return [p1, p2, p3, p4].join("\n\n");
}

function buildFaq(title, i) {
  return [
    {
      question: `What is this update about regarding ${pick(SUBJECTS, i)}?`,
      answer: `It summarizes how architecture and construction workflows are evolving around ${pick(SUBJECTS, i)}, with emphasis on practical decisions teams make during design and delivery.`,
    },
    {
      question: "Who is this article for?",
      answer:
        "Architects, engineers, contractors, developers, and students who need a reliable editorial summary with citations to broader industry trends and delivery considerations.",
    },
    {
      question: "How should teams apply this information?",
      answer:
        "Use it as a briefing companion—then validate requirements against local codes, manufacturer data, and project-specific risk reviews before specification lock.",
    },
  ];
}

const items = [];
const TARGET = 420;

for (let i = 0; i < TARGET; i++) {
  const title = buildTitle(i);
  const category = pick(CATEGORIES, i);
  const region = pick(REGIONS, i + 4);
  const slug = `${slugify(title)}-${pad(i + 1, 4)}`;
  const excerpt = buildExcerpt(title, i).slice(0, 320);
  const body = buildBody(title, category, region, i);
  const seoTitle = `${title} | Architecture News | the9thedition`;
  const seoDescription = `${excerpt.slice(0, 155)}…`;
  const keywords = [
    "architecture news",
    "construction",
    "building industry",
    category.toLowerCase(),
    pick(SUBJECTS, i).replace(/\s+/g, " "),
    region.toLowerCase(),
    "design",
    "built environment",
    "AEC",
  ];
  const imageId = pick(UNSPLASH, i);
  const image_url = `https://images.unsplash.com/photo-${imageId}?auto=format&fit=crop&w=1600&q=80`;

  items.push({
    id: `an-${pad(i + 1, 5)}`,
    slug,
    title,
    excerpt,
    body,
    category,
    published_at: isoDate(i),
    image_url,
    seo_title: seoTitle.slice(0, 200),
    seo_description: seoDescription.slice(0, 160),
    keywords,
    faq: buildFaq(title, i),
    geo_region: region,
    author: "the9thedition Editorial",
    date_modified: new Date().toISOString(),
  });
}

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify({ generatedAt: new Date().toISOString(), count: items.length, items }, null, 0));

console.log(`Wrote ${items.length} items to ${OUT}`);
