import type { BuildSpec, ProjectArticle, ProjectDetailMedia } from "@/lib/project-detail-content";
import { stripInternalProjectCopy } from "@/lib/project-detail-content";
import { sanitizeExcerpt } from "@/lib/editorial-sanitize";
import type { PublishedProject } from "@/lib/published-projects";
import { generatedGalleryPaths } from "@/lib/generated-media";

const DEFAULT_MANUFACTURERS =
  "Stone, lime, timber and glazing per narrative; verify submittals for your site.";

function formRecord(published: PublishedProject): Record<string, unknown> {
  return (published.form_data ?? {}) as Record<string, unknown>;
}

export function getPublishedProjectArticle(published: PublishedProject): ProjectArticle {
  const form = formRecord(published);
  const firm = String(form.architectureFirm ?? "").trim() || published.byline?.replace(/^By\s+/i, "").trim() || "";
  const lead = String(form.leadArchitect ?? form.leadArchitects ?? firm).trim() || firm;
  const projectType = String(form.projectType ?? "Residential");

  const specs: BuildSpec[] = [
    { label: "Category", value: published.category || String(form.category ?? "Architecture & Design") },
    { label: "Location", value: published.location ?? String(form.projectLocation ?? "India") },
    { label: "Project type", value: projectType },
    {
      label: "Area",
      value: String(form.grossBuiltArea ?? "").trim() || "See project narrative",
    },
    { label: "Year", value: String(form.completionYear ?? "").trim() || "—" },
    {
      label: "Architects",
      value: firm && lead ? `${lead}, ${firm}` : firm || lead || "See project credits",
    },
    { label: "Lead", value: lead || firm || "—" },
    {
      label: "Manufacturers",
      value: String(form.manufacturers ?? DEFAULT_MANUFACTURERS),
    },
  ];

  const climate = String(form.climateStrategy ?? "").trim();
  const materials = String(form.primaryMaterials ?? "").trim();
  if (climate) specs.push({ label: "Climate strategy", value: climate });
  if (materials) specs.push({ label: "Primary materials", value: materials });

  const narrative = String(published.content ?? form.narrative ?? form.longText ?? "").trim();
  const paragraphs = narrative
    ? narrative.split(/\n\n+/).map((p) => p.trim()).filter(Boolean)
    : [published.excerpt ?? ""];

  const faqRaw = form.faq;
  const faq =
    Array.isArray(faqRaw) && faqRaw.length
      ? (faqRaw as { question: string; answer: string }[])
      : [
          {
            question: "What is this project about?",
            answer: `${published.title} is documented on the9thedition with build details and photography from the design team.`,
          },
        ];

  const uploaded = published.image_urls.filter(Boolean);
  const gallery =
    uploaded.length > 0
      ? uploaded
      : published.hero_image_url
        ? [published.hero_image_url, ...generatedGalleryPaths("projects", published.slug).slice(1, 12)]
        : generatedGalleryPaths("projects", published.slug).slice(0, 12);

  const imageAlts = gallery.map((_, i) =>
    i === 0
      ? `Hero — ${published.title} (frame ${i + 1})`
      : `Visual study — ${published.title} (frame ${i + 1})`,
  );

  const media: ProjectDetailMedia = {};

  return stripInternalProjectCopy({
    dek: sanitizeExcerpt(published.excerpt ?? String(form.dek ?? form.shortText ?? "")),
    paragraphs,
    specs,
    gallery,
    imageAlts,
    faq,
    seo: {
      title: `${published.title} | Projects | the9thedition`,
      description: (published.excerpt ?? narrative).slice(0, 160),
      keywords: [published.category, projectType, firm, published.location ?? "India"].filter(Boolean),
      geo_region: published.location ?? "India",
    },
    media,
  });
}
