import { createInsForgeServerClient } from "@/lib/insforge-server";

export type SubmissionRow = {
  id: string;
  title: string;
  kind: string;
  status: string;
  created_at: string;
  published_slug: string | null;
};

export async function getMySubmissions(accessToken: string): Promise<SubmissionRow[]> {
  const client = createInsForgeServerClient(accessToken);
  const { data, error } = await client.database
    .from("submissions")
    .select("id, title, kind, status, created_at, published_slug")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.warn("getMySubmissions:", error.message);
    return [];
  }
  const rows = Array.isArray(data) ? data : [];
  return rows as SubmissionRow[];
}
