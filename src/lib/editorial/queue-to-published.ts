import { editorialFromQueueRow, formDataFromEditorial } from "@/lib/editorial/sync";
import type { PublishedProject } from "@/lib/published-projects";

type QueueRow = {
  id: string;
  title: string;
  content_type: string;
  source_text?: string;
  form_data?: Record<string, unknown> | null;
  image_urls?: string[];
  video_links?: string[];
  layout_blocks?: unknown;
  taxonomy_name?: string | null;
  published_slug?: string | null;
  editorial_payload?: unknown;
  is_trending?: boolean;
};

/** Map a queue row into a PublishedProject-shaped object for admin preview. */
export function queueRowToPublishedPreview(row: QueueRow, slug: string): PublishedProject {
  const editorial = editorialFromQueueRow(row);
  const form = {
    ...(row.form_data ?? {}),
    ...formDataFromEditorial(editorial, row.title),
  };
  const images = row.image_urls ?? [];
  const hero = editorial.media.heroImage?.url ?? images[0] ?? null;
  const firm = editorial.generalInfo.leadArchitects?.[0] ?? row.taxonomy_name ?? "";
  return {
    slug,
    title: row.title,
    excerpt:
      editorial.content.summary ??
      (typeof form.shortText === "string" ? form.shortText.slice(0, 220) : null) ??
      null,
    content: editorial.content.narrative ?? row.source_text ?? null,
    category: editorial.metadata.category ?? "Architecture & Design",
    location: editorial.generalInfo.projectLocation ?? null,
    byline: firm ? `By ${firm}` : null,
    hero_image_url: hero,
    image_urls: images,
    video_links: row.video_links ?? [],
    external_links: [],
    form_data: form,
    layout_blocks: row.layout_blocks,
    is_trending: Boolean(row.is_trending),
    published_at: new Date().toISOString(),
  };
}
