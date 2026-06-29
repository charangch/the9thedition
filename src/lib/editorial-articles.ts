import data from "@/data/editorial-articles.json";
import { sanitizeBodyText, sanitizeExcerpt, sanitizeFaq } from "@/lib/editorial-sanitize";

export type EditorialFaq = { question: string; answer: string };

export type EditorialArticle = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  category: string;
  focus_entity: string;
  image_alts: string[];
  keywords: string[];
  faq: EditorialFaq[];
  geo_region: string;
  seo_title: string;
  seo_description: string;
  published_at: string;
  date_modified: string;
};

type EditorialFile = {
  generatedAt: string;
  count: number;
  items: EditorialArticle[];
};

const corpus = data as EditorialFile;

const PAGE_SIZE = 12;

function cleanArticle(item: EditorialArticle): EditorialArticle {
  const excerpt = sanitizeExcerpt(item.excerpt);
  return {
    ...item,
    excerpt,
    body: sanitizeBodyText(item.body),
    faq: sanitizeFaq(item.faq),
    seo_description: sanitizeExcerpt(item.seo_description) || excerpt,
  };
}

function normalizeQuery(q: string | null | undefined): string | null {
  const t = q?.trim();
  return t?.length ? t : null;
}

function matchesQuery(item: EditorialArticle, query: string | null): boolean {
  if (!query) return true;
  const needle = query.toLowerCase();
  const hay = [
    item.title,
    item.excerpt,
    item.body,
    item.focus_entity,
    item.category,
    item.geo_region,
    ...item.keywords,
  ]
    .join(" ")
    .toLowerCase();
  return hay.includes(needle);
}

export function getAllEditorialArticles(): EditorialArticle[] {
  return corpus.items.map(cleanArticle);
}

export function getEditorialArticleSlugs(): string[] {
  return corpus.items.map((x) => x.slug);
}

export function getEditorialArticleBySlug(slug: string): EditorialArticle | undefined {
  const item = corpus.items.find((x) => x.slug === slug);
  return item ? cleanArticle(item) : undefined;
}

export function getEditorialCategories(): string[] {
  return [...new Set(corpus.items.map((x) => x.category))].sort();
}

export function getFeaturedEditorialArticle(): EditorialArticle {
  return cleanArticle(corpus.items[0]!);
}

export function getRelatedEditorialArticles(slug: string, limit = 4): EditorialArticle[] {
  const current = getEditorialArticleBySlug(slug);
  if (!current) return [];
  const same = corpus.items.filter((x) => x.slug !== slug && x.category === current.category);
  const other = corpus.items.filter((x) => x.slug !== slug && x.category !== current.category);
  return [...same, ...other].slice(0, limit).map(cleanArticle);
}

export function listEditorialArticlesPage(
  page: number,
  category: string | null,
  query: string | null,
): {
  items: EditorialArticle[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
} {
  const q = normalizeQuery(query);
  const filtered = corpus.items.filter((x) => {
    if (category && x.category !== category) return false;
    return matchesQuery(x, q);
  });
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  return {
    items: filtered.slice(start, start + PAGE_SIZE).map(cleanArticle),
    total,
    page: safePage,
    pageSize: PAGE_SIZE,
    totalPages,
  };
}
