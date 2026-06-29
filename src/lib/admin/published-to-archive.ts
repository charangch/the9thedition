import type { ArchiveProject } from "@/lib/archive-projects";
import type { PublishedProject } from "@/lib/published-projects";
import { sanitizeExcerpt } from "@/lib/editorial-sanitize";
import { generatedImagePath } from "@/lib/generated-media";

export function publishedToArchiveProject(p: PublishedProject): ArchiveProject {
  const hero = p.hero_image_url ?? p.image_urls[0] ?? generatedImagePath("projects", p.slug, 0);
  const when = p.archived_at ?? p.published_at ?? new Date().toISOString();
  const excerpt = sanitizeExcerpt(p.excerpt ?? "");
  return {
    id: `published-${p.slug}`,
    slug: p.slug,
    title: p.title,
    excerpt,
    content: p.content ?? excerpt,
    category: p.category || "Architecture & Design",
    location: p.location ?? "",
    byline: p.byline ?? "",
    year: "",
    area: "",
    renderCredits: "",
    hero_image_url: hero,
    image_urls: p.image_urls.length ? p.image_urls : [hero],
    video_links: p.video_links,
    keywords: [p.category, p.location ?? ""].filter(Boolean),
    faq: [],
    geo_region: p.location ?? "",
    seo_title: `${p.title} | Archive | the9thedition`,
    seo_description: excerpt || p.title,
    published_at: when,
    date_modified: when,
  };
}
