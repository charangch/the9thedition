import { createInsForgeServerClientPublic } from "@/lib/insforge-server";

export type PublishedStudent = {
  slug: string;
  title: string;
  excerpt: string | null;
  content: string | null;
  category: string;
  school_name: string | null;
  image_urls: string[];
  video_links: string[];
  form_data: Record<string, unknown> | null;
  published_at?: string | null;
};

export async function getPublishedStudents(limit = 100): Promise<PublishedStudent[]> {
  const client = createInsForgeServerClientPublic();
  const { data, error } = await client.database
    .from("published_students")
    .select("slug, title, excerpt, content, category, school_name, image_urls, video_links, form_data, published_at")
    .order("published_at", { ascending: false })
    .limit(limit);
  if (error) return [];
  const rows = Array.isArray(data) ? data : [];
  return rows.map((row) => ({
    ...(row as PublishedStudent),
    image_urls: Array.isArray((row as PublishedStudent).image_urls)
      ? (row as PublishedStudent).image_urls
      : [],
    video_links: Array.isArray((row as PublishedStudent).video_links)
      ? (row as PublishedStudent).video_links
      : [],
  }));
}

export async function getPublishedStudentBySlug(slug: string): Promise<PublishedStudent | null> {
  const client = createInsForgeServerClientPublic();
  const { data, error } = await client.database
    .from("published_students")
    .select("slug, title, excerpt, content, category, school_name, image_urls, video_links, form_data, published_at")
    .eq("slug", slug)
    .limit(1);
  if (error) return null;
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) return null;
  return {
    ...(row as PublishedStudent),
    image_urls: Array.isArray((row as PublishedStudent).image_urls)
      ? (row as PublishedStudent).image_urls
      : [],
    video_links: Array.isArray((row as PublishedStudent).video_links)
      ? (row as PublishedStudent).video_links
      : [],
  };
}
