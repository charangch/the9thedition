import data from "@/data/architecture-news.json";

export type ArchitectureNewsFaq = { question: string; answer: string };

export type ArchitectureNewsItem = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  category: string;
  published_at: string;
  image_url: string;
  seo_title: string;
  seo_description: string;
  keywords: string[];
  faq: ArchitectureNewsFaq[];
  geo_region: string;
  author: string;
  date_modified: string;
};

type NewsFile = {
  generatedAt: string;
  count: number;
  items: ArchitectureNewsItem[];
};

const corpus = data as NewsFile;

const PAGE_SIZE = 12;

export function getAllArchitectureNews(): ArchitectureNewsItem[] {
  return corpus.items;
}

export function getArchitectureNewsSlugs(): string[] {
  return corpus.items.map((x) => x.slug);
}

export function getArchitectureNewsBySlug(slug: string): ArchitectureNewsItem | undefined {
  return corpus.items.find((x) => x.slug === slug);
}

export function getRelatedArchitectureNews(slug: string, limit = 4): ArchitectureNewsItem[] {
  const current = getArchitectureNewsBySlug(slug);
  if (!current) return [];
  const same = corpus.items.filter((x) => x.slug !== slug && x.category === current.category);
  const other = corpus.items.filter((x) => x.slug !== slug && x.category !== current.category);
  return [...same, ...other].slice(0, limit);
}

export function getArchitectureNewsCategories(): string[] {
  return [...new Set(corpus.items.map((x) => x.category))].sort();
}

export function listArchitectureNewsPage(
  page: number,
  category: string | null,
): {
  items: ArchitectureNewsItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
} {
  const filtered = category
    ? corpus.items.filter((x) => x.category === category)
    : corpus.items;
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  return {
    items: filtered.slice(start, start + PAGE_SIZE),
    total,
    page: safePage,
    pageSize: PAGE_SIZE,
    totalPages,
  };
}

export function getFeaturedArchitectureNews(): ArchitectureNewsItem {
  return corpus.items[0]!;
}
