import type { MetadataRoute } from "next";
import { getArchitectureNewsSlugs } from "@/lib/architecture-news";
import { getArchiveProjectSlugs } from "@/lib/archive-projects";
import { getEditorialArticleSlugs } from "@/lib/editorial-articles";
import { getTop100Slugs } from "@/lib/top100-projects";
import { getSiteUrl } from "@/lib/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const now = new Date();
  const newsSlugs = getArchitectureNewsSlugs();
  const archiveSlugs = getArchiveProjectSlugs();
  const editorialSlugs = getEditorialArticleSlugs();
  const top100Slugs = getTop100Slugs();

  const newsEntries: MetadataRoute.Sitemap = newsSlugs.map((slug) => ({
    url: `${base}/architecture-news/${slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.72,
  }));

  const archiveEntries: MetadataRoute.Sitemap = archiveSlugs.map((slug) => ({
    url: `${base}/archive/${slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.68,
  }));

  const articleEntries: MetadataRoute.Sitemap = editorialSlugs.map((slug) => ({
    url: `${base}/articles/${slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const top100Entries: MetadataRoute.Sitemap = top100Slugs.map((slug) => ({
    url: `${base}/top-100/${slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.74,
  }));

  return [
    { url: base, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${base}/architecture-news`, lastModified: now, changeFrequency: "daily", priority: 0.95 },
    { url: `${base}/archive`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/projects`, lastModified: now, changeFrequency: "weekly", priority: 0.85 },
    { url: `${base}/articles`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/top-100`, lastModified: now, changeFrequency: "weekly", priority: 0.82 },
    ...newsEntries,
    ...archiveEntries,
    ...articleEntries,
    ...top100Entries,
  ];
}
