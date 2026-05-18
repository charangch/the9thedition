import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { PublishedProjectDetail } from "@/components/published-project-detail";
import { SiteHeader } from "@/components/site-header";
import { formFromQueueRow } from "@/lib/admin/project-publish-schema";
import { queueRowToPublishedPreview } from "@/lib/editorial/queue-to-published";
import { createInsForgeServerClient } from "@/lib/insforge-server";
import { requireAdminSession } from "@/lib/admin-session";

type Props = { searchParams: Promise<{ id?: string }> };

export default async function AdminSubmissionPreviewPage({ searchParams }: Props) {
  const admin = await requireAdminSession();
  if (!admin) redirect("/login?next=/admin/submissions");

  const { id } = await searchParams;
  if (!id) notFound();

  const client = createInsForgeServerClient(admin.session.accessToken);
  const { data: rows, error } = await client.database.from("admin_publishing_queue").select("*").eq("id", id).limit(1);
  if (error) notFound();
  const row = Array.isArray(rows) ? rows[0] : rows;
  if (!row) notFound();

  const form = formFromQueueRow({
    title: row.title,
    form_data: row.form_data,
    image_urls: row.image_urls,
    video_links: row.video_links,
  });
  const slug = String(row.published_slug ?? `preview-${id}`);
  const published = queueRowToPublishedPreview(
    {
      ...row,
      title: form.projectName,
      form_data: { ...form, faq: form.faq },
      image_urls: form.galleryUrls ?? row.image_urls,
      video_links: form.videoUrl ? [form.videoUrl] : row.video_links,
      excerpt: form.dek,
      content: form.narrative,
    },
    slug,
  );

  return (
    <>
      <SiteHeader />
      <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-xs uppercase tracking-[0.14em] text-amber-900">
        Admin preview ·{" "}
        <Link href="/admin/submissions" className="underline">
          Back
        </Link>
      </div>
      <PublishedProjectDetail published={published} allPublished={[]} />
    </>
  );
}
