import { createInsForgeServerClient } from "@/lib/insforge-server";

function directusUrl() {
  return process.env.DIRECTUS_URL?.trim() || "";
}
function directusToken() {
  return process.env.DIRECTUS_STATIC_TOKEN?.trim() || "";
}

export async function publishSubmissionToCms(params: {
  submissionId: string;
  title: string;
  body: string;
  kind: "project" | "student" | "photographer" | "company";
}) {
  const url = directusUrl();
  const token = directusToken();
  if (!url || !token) return { ok: false, reason: "cms_not_configured" as const };

  const collection = "projects";
  const slug = params.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 140);

  const res = await fetch(`${url}/items/${collection}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      title: params.title,
      slug: slug || params.submissionId,
      excerpt: params.body.slice(0, 220),
      body: params.body,
      source_submission_id: params.submissionId,
      category: params.kind,
      published_at: new Date().toISOString(),
    }),
  }).catch(() => null);

  if (!res?.ok) {
    return { ok: false, reason: "cms_publish_failed" as const };
  }
  return { ok: true as const };
}

export async function getAdminAuditRows(accessToken: string) {
  const client = createInsForgeServerClient(accessToken);
  const { data } = await client.database
    .from("admin_audit_log")
    .select("id, action, entity_type, entity_id, payload, created_at")
    .order("created_at", { ascending: false })
    .limit(100);
  return Array.isArray(data) ? data : [];
}
