/**
 * Generates src/data/archive-projects.json — 300 curated archive projects.
 * Run: node scripts/generate-archive-projects.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, "../src/data/archive-projects.json");

const CATEGORIES = [
  "Cultural Architecture",
  "Residential Architecture",
  "Educational Architecture",
  "Hospitality Architecture",
  "Public Architecture",
  "Landscape & Urbanism",
  "Commercial & Offices",
  "Infrastructure",
  "Interior Design",
  "Adaptive Reuse",
  "Healthcare Architecture",
  "Sports & Recreation",
];

const CITIES = [
  "Mumbai",
  "Delhi NCR",
  "Bangalore",
  "Chennai",
  "Hyderabad",
  "Ahmedabad",
  "Kolkata",
  "Pune",
  "Kochi",
  "Jaipur",
  "Singapore",
  "Dubai",
  "London",
  "Berlin",
  "Copenhagen",
  "São Paulo",
  "Mexico City",
  "Tokyo",
  "Sydney",
  "Lagos",
];

const FIRMS = [
  "Studio Continuum",
  "Atelier Meridian",
  "Terrain Works",
  "Volume Architects",
  "Lattice & Light",
  "Monsoon Office",
  "Harbor Line Studio",
  "North-South Practice",
  "Civic Fabric",
  "Open Section",
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
  "1600566752355-357f3e3a5b57",
  "1523212462562-432d6ba3a6d0",
];

const THEMES = [
  "courtyard",
  "limestone",
  "timber canopy",
  "perforated metal screen",
  "terracotta rainscreen",
  "cross-laminated timber",
  "rammed earth",
  "brick lattice",
  "concrete shell",
  "green roof",
  "shaded colonnade",
  "waterfront promenade",
];

function pad(n, w) {
  return String(n).padStart(w, "0");
}

function slugify(s) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 64);
}

function pick(arr, i) {
  return arr[i % arr.length];
}

function isoDate(seed) {
  const start = new Date("2012-03-01T10:00:00.000Z").getTime();
  const dayMs = 86400000;
  return new Date(start + (seed % 900) * dayMs + (seed * 13) % dayMs).toISOString();
}

function buildTitle(i) {
  const city = pick(CITIES, i * 3);
  const theme = pick(THEMES, i * 7);
  const cat = pick(CATEGORIES, i);
  const forms = [
    `${cat.split(" ")[0]} Study: ${theme} in ${city}`,
    `Archive Feature: A ${theme.replace(/-/g, " ")} Landmark in ${city}`,
    `${city} Chronicle: ${cat} and ${theme.replace(/-/g, " ")}`,
    `Heritage Line: ${theme.replace(/-/g, " ")} Across Scales in ${city}`,
    `Built Record: ${cat} with a ${theme.replace(/-/g, " ")} Focus`,
  ];
  return forms[i % forms.length];
}

function buildBody(title, city, firm, i) {
  const p1 = `${title} documents a built work that continues to circulate in teaching studios and competition briefs. The project demonstrates how brief, climate, and procurement constraints were translated into a coherent spatial idea with legible tectonics.`;

  const p2 = `Led by ${firm}, the scheme responds to ${city}'s regulatory and environmental context while maintaining a clear public-facing identity. Circulation, daylight, and material durability were coordinated early with engineers and specialists—an approach that later influenced regional guidance on similar building types.`;

  const p3 = `This archive entry preserves photography credits, key metrics, and narrative context so researchers can compare approaches across decades. For contemporary teams, the lesson is less about copying details than about understanding decision sequencing: which moves were fixed early, and which remained flexible through construction.`;

  const p4 = `Editors classify the work under recurring editorial tags—${pick(THEMES, i + 1)}, ${pick(THEMES, i + 2)}—to help readers discover related case studies across regions and scales.`;

  return [p1, p2, p3, p4].join("\n\n");
}

function faqFor(title, city) {
  return [
    {
      question: `What is this archive project about?`,
      answer: `It is an editorial record of a built or documented scheme connected to ${city}, summarized for discovery, comparison, and citation in research workflows.`,
    },
    {
      question: "Who should read this page?",
      answer:
        "Architects, students, developers, and consultants looking for precedent, narrative context, and structured metadata alongside imagery.",
    },
    {
      question: "How do I reference this entry?",
      answer:
        "Cite the9thedition archive URL, the project title, and the publication date shown on this page; verify on-site measurements with the original architect where required.",
    },
  ];
}

const items = [];
const TARGET = 300;

for (let i = 0; i < TARGET; i++) {
  const title = buildTitle(i);
  const slug = `arch-${slugify(title)}-${pad(i + 1, 4)}`;
  const category = pick(CATEGORIES, i);
  const location = `${pick(CITIES, i + 2)}, ${pick(["India", "UAE", "UK", "Germany", "Denmark", "Brazil", "Mexico", "Japan", "Australia", "Nigeria"], i)}`;
  const firm = pick(FIRMS, i + 5);
  const year = String(1998 + (i % 22));
  const area = `${1200 + (i % 40) * 85} m²`;
  const excerpt = `${title.split(":")[0] || "Archive entry"} — documented ${category.toLowerCase()} with editorial notes, imagery, and build details for research and precedent study.`;
  const content = buildBody(title, pick(CITIES, i * 3), firm, i);
  const hero = `https://images.unsplash.com/photo-${pick(UNSPLASH, i)}?auto=format&fit=crop&w=2000&q=82`;
  const image_urls = Array.from({ length: 8 }, (_, j) => {
    const id = pick(UNSPLASH, i + j * 11);
    return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1600&q=80`;
  });
  const keywords = [
    "architecture archive",
    "built projects",
    category.toLowerCase(),
    pick(CITIES, i).toLowerCase(),
    "design precedent",
    "construction",
    "the9thedition",
  ];
  items.push({
    id: `ar-${pad(i + 1, 5)}`,
    slug,
    title,
    excerpt,
    content,
    category,
    location,
    byline: `By ${firm}`,
    year,
    area,
    renderCredits: i % 3 === 0 ? "Archive photography: various contributors" : `Photography: Studio ${pick(["North", "South", "East", "West"], i)} Visuals`,
    hero_image_url: hero,
    image_urls,
    video_links: [],
    keywords,
    faq: faqFor(title, pick(CITIES, i * 3)),
    geo_region: pick(
      ["South Asia", "Middle East", "Europe", "Americas", "East Asia", "Oceania", "Africa"],
      i,
    ),
    seo_title: `${title} | Project Archive | the9thedition`,
    seo_description: excerpt.slice(0, 158),
    published_at: isoDate(i),
    date_modified: new Date().toISOString(),
  });
}

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify({ generatedAt: new Date().toISOString(), count: items.length, items }, null, 0));

console.log(`Wrote ${items.length} archive projects to ${OUT}`);
