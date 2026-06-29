import data from "@/data/archive-projects.json";
import { sanitizeBodyText, sanitizeExcerpt, sanitizeFaq } from "@/lib/editorial-sanitize";

export type ArchiveProjectFaq = { question: string; answer: string };

export type ArchiveProject = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  location: string;
  byline: string;
  year: string;
  area: string;
  renderCredits: string;
  hero_image_url: string;
  image_urls: string[];
  video_links: string[];
  keywords: string[];
  faq: ArchiveProjectFaq[];
  geo_region: string;
  seo_title: string;
  seo_description: string;
  published_at: string;
  date_modified: string;
};

type ArchiveFile = { generatedAt: string; count: number; items: ArchiveProject[] };

const corpus = data as ArchiveFile;

const PAGE_SIZE = 12;

function cleanArchiveProject(item: ArchiveProject): ArchiveProject {
  const excerpt = sanitizeExcerpt(item.excerpt);
  return {
    ...item,
    excerpt,
    content: sanitizeBodyText(item.content),
    faq: sanitizeFaq(item.faq),
    seo_description: sanitizeExcerpt(item.seo_description) || excerpt,
  };
}

export function getAllArchiveProjects(): ArchiveProject[] {
  return corpus.items.map(cleanArchiveProject);
}

export function getArchiveProjectSlugs(): string[] {
  return corpus.items.map((x) => x.slug);
}

export function getArchiveProjectBySlug(slug: string): ArchiveProject | undefined {
  const item = corpus.items.find((x) => x.slug === slug);
  return item ? cleanArchiveProject(item) : undefined;
}

export function getArchiveCategories(): string[] {
  return [...new Set(corpus.items.map((x) => x.category))].sort();
}

export function getRelatedArchiveProjects(slug: string, limit = 4): ArchiveProject[] {
  const cur = getArchiveProjectBySlug(slug);
  if (!cur) return [];
  const same = corpus.items.filter((x) => x.slug !== slug && x.category === cur.category);
  const rest = corpus.items.filter((x) => x.slug !== slug && x.category !== cur.category);
  return [...same, ...rest].slice(0, limit).map(cleanArchiveProject);
}

export function listArchiveProjects(params: {
  page: number;
  category: string | null;
  q: string | null;
}): {
  items: ArchiveProject[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
} {
  let filtered = corpus.items;
  const cat = params.category?.trim();
  if (cat) {
    filtered = filtered.filter((x) => x.category === cat);
  }
  const q = params.q?.trim().toLowerCase();
  if (q) {
    filtered = filtered.filter((x) => {
      const hay = `${x.title} ${x.excerpt} ${x.location} ${x.category} ${x.byline}`.toLowerCase();
      return hay.includes(q);
    });
  }
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(Math.max(1, params.page), totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  return {
    items: filtered.slice(start, start + PAGE_SIZE).map(cleanArchiveProject),
    total,
    page: safePage,
    pageSize: PAGE_SIZE,
    totalPages,
  };
}

export function getFeaturedArchiveProject(): ArchiveProject {
  return cleanArchiveProject(corpus.items[0]!);
}
