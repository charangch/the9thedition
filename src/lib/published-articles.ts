import { createInsForgeServerClientPublic } from "@/lib/insforge-server";

export type PublishedArticle = {
  slug: string;
  title: string;
  excerpt: string | null;
  body: string | null;
  category: string | null;
  image_url: string | null;
  layout_blocks: unknown;
  published_at?: string | null;
};

const articleSelect = "slug, title, excerpt, body, category, image_url, layout_blocks, published_at";

export async function getPublishedArticleBySlug(slug: string): Promise<PublishedArticle | null> {
  const client = createInsForgeServerClientPublic();
  const { data, error } = await client.database.from("articles").select(articleSelect).eq("slug", slug).limit(1);
  if (error) return null;
  const row = Array.isArray(data) ? data[0] : data;
  return (row as PublishedArticle | undefined) ?? null;
}
