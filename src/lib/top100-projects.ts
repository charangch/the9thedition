import data from "@/data/top100-projects.json";

export type Top100Faq = { question: string; answer: string };

export type Top100Project = {
  id: string;
  slug: string;
  rank: number;
  title: string;
  excerpt: string;
  body: string;
  typology: string;
  location: string;
  geo_region: string;
  keywords: string[];
  faq: Top100Faq[];
  seo_title: string;
  seo_description: string;
  published_at: string;
  date_modified: string;
  image_alts: string[];
};

type Top100File = {
  generatedAt: string;
  count: number;
  items: Top100Project[];
};

const corpus = data as Top100File;

export function getAllTop100Projects(): Top100Project[] {
  return [...corpus.items].sort((a, b) => a.rank - b.rank);
}

export function getTop100Slugs(): string[] {
  return corpus.items.map((x) => x.slug);
}

export function getTop100ProjectBySlug(slug: string): Top100Project | undefined {
  return corpus.items.find((x) => x.slug === slug);
}

export function getRelatedTop100(slug: string, limit = 4): Top100Project[] {
  const current = getTop100ProjectBySlug(slug);
  if (!current) return [];
  const same = corpus.items.filter((x) => x.slug !== slug && x.typology === current.typology);
  const other = corpus.items.filter((x) => x.slug !== slug && x.typology !== current.typology);
  return [...same, ...other].slice(0, limit);
}
