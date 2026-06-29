import type { ArchitectProfile } from "@/lib/architects";
import { EDITORIAL_FILLER_PATTERN, sanitizeExcerpt, sanitizeFaq } from "@/lib/editorial-sanitize";
import { generatedGalleryPaths } from "@/lib/generated-media";
import { catalogProjectGalleryPaths } from "@/lib/catalog-project-images";
import { getProjectLongForm } from "@/lib/project-long-form";
import type { ProjectEntry } from "@/lib/project-catalog";

export type BuildSpec = { label: string; value: string };

export type ProjectDetailMedia = {
  extraImageUrls?: string[];
  videoUrl?: string;
  videoCaption?: string;
  pdfUrl?: string;
  pdfLabel?: string;
};

export type ProjectSeoMeta = {
  title: string;
  description: string;
  keywords: string[];
  geo_region: string;
};

export type ProjectArticle = {
  dek: string;
  paragraphs: string[];
  specs: BuildSpec[];
  /** Twenty on-site procedural image URLs (`/api/generated-image?c=projects&...`). */
  gallery: string[];
  media: ProjectDetailMedia;
  imageAlts: string[];
  faq: { question: string; answer: string }[];
  seo: ProjectSeoMeta | null;
};

function hashPick(s: string, max: number) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return (h % max) + 1;
}

function baseSpecs(project: ProjectEntry, architect?: ArchitectProfile): BuildSpec[] {
  const year = 2023 + ((hashPick(project.slug, 3) - 1) as 0 | 1 | 2);
  const areaM2 = 180 + hashPick(project.slug, 2000);
  const specs: BuildSpec[] = [
    { label: "Category", value: project.category },
    { label: "Location", value: project.location ?? "India" },
    { label: "Project type", value: project.projectType },
    { label: "Area", value: `Approx. ${areaM2.toLocaleString()} m²` },
    { label: "Year", value: String(year) },
  ];
  if (architect) {
    specs.push({ label: "Architects", value: `${architect.name}, ${architect.firm}` });
    specs.push({ label: "Lead", value: architect.name });
  } else {
    specs.push({ label: "Architects", value: "See project credits" });
  }
  specs.push({
    label: "Manufacturers",
    value: "Stone, lime, timber and glazing per narrative; verify submittals for your site.",
  });
  return specs;
}

function fallbackParagraphs(project: ProjectEntry, architect?: ArchitectProfile): string[] {
  return [
    `${project.excerpt}`,
    `The project explores ${project.category.toLowerCase()} through a disciplined plan: circulation is clear, rooms are scaled for contemporary living, and daylight is treated as a primary material. ${architect ? `Led by ${architect.firm}, the team emphasised regional intelligibility without pastiche—details are contemporary, references are local.` : "Material choices favour longevity and tactility over novelty."}`,
    `Interiors balance openness with acoustic comfort—soft surfaces, careful proportions, and layered lighting create rooms that feel calm at different times of day. Landscape and built form are read as one system: shading, planting, and thresholds are coordinated rather than added later.`,
    `As built, the work demonstrates how premium architecture can align comfort, climate, and craft—an approach that scales from façade to furniture handle. For researchers: verify code compliance, manufacturer data, and site-specific climate files before specifying analogous systems.`,
  ];
}

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function sanitizeParagraph(text: string): string {
  return text
    .replace(/^_?\s*Text description provided by the architects\.?\s*_?\s*/i, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function trimToWords(text: string, limit: number): string {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length <= limit) return text.trim();
  return `${words.slice(0, limit).join(" ")}.`;
}

function ensureLengthBetween500And700(
  project: ProjectEntry,
  paragraphs: string[],
  architect?: ArchitectProfile,
  geo?: string,
): string[] {
  const cleaned = paragraphs.map(sanitizeParagraph).filter(Boolean);
  const minWords = 520;
  const maxWords = 700;
  const category = project.category;
  const projectType = project.projectType;
  const place = project.location ?? "India";
  const studio = architect?.firm ?? "the design team";
  const region = geo ?? place;

  const additions = [
    `${studio} developed the scheme through iterative climatic studies rather than a one-pass aesthetic concept. Orientation, opening percentages, and shading depth were tested against seasonal sun and daily occupancy, allowing the plan to reduce heat gain during peak hours while preserving daylight quality in occupied rooms.`,
    `Material strategy is treated as a performance system. Surfaces are selected for tactile depth and durability, but also for moisture behaviour, repairability, and availability in the local supply chain. This approach lowers long-term maintenance risk and keeps replacements realistic for owners over a 10- to 20-year lifecycle.`,
    `Spatially, the project balances ceremonial arrival with practical daily routines. Service circulation, storage, and wet areas are coordinated early so primary rooms remain visually calm. The resulting sequence avoids dead corners, supports flexible furniture use, and maintains clear sightlines that enhance both comfort and supervision.`,
    `For ${category.toLowerCase()} work in ${region}, buildability is as important as concept clarity. Drawings and site decisions should account for contractor skill levels, procurement lead times, and monsoon or summer sequencing constraints. This reduces site improvisation and protects design intent through execution.`,
    `In summary, the project demonstrates how contemporary design quality can coexist with climate intelligence, craft knowledge, and operational realism. Rather than relying on oversized floor area or trend-driven finishes, it builds value through proportion, envelope performance, and coherent detailing from master plan to joinery.`,
  ];

  let total = cleaned.reduce((n, p) => n + wordCount(p), 0);
  const out = [...cleaned];
  let idx = 0;
  while (total < minWords && idx < additions.length) {
    out.push(additions[idx]!);
    total += wordCount(additions[idx]!);
    idx += 1;
  }

  if (total > maxWords) {
    const trimmed: string[] = [];
    let running = 0;
    for (const p of out) {
      const c = wordCount(p);
      if (running + c <= maxWords) {
        trimmed.push(p);
        running += c;
      } else {
        const remaining = maxWords - running;
        if (remaining > 24) trimmed.push(trimToWords(p, remaining));
        break;
      }
    }
    return trimmed;
  }
  return out;
}

/** Filters CMS/workflow placeholder copy from project body text (catalog + published). */
export const INTERNAL_WORKFLOW_COPY_PATTERN = EDITORIAL_FILLER_PATTERN;

function stripInternalCatalogCopy(article: ProjectArticle): ProjectArticle {
  return stripInternalProjectCopy(article);
}

export function stripInternalProjectCopy(article: ProjectArticle): ProjectArticle {
  return {
    ...article,
    paragraphs: article.paragraphs.filter((p) => !INTERNAL_WORKFLOW_COPY_PATTERN.test(p)),
    specs: article.specs.filter(
      (row) => row.label !== "Imagery" && !INTERNAL_WORKFLOW_COPY_PATTERN.test(row.value),
    ),
    faq: sanitizeFaq(article.faq),
    media: {
      ...article.media,
      videoUrl: undefined,
      videoCaption: undefined,
    },
  };
}

function defaultImageAlts(title: string): string[] {
  return Array.from({ length: 7 }, (_, j) =>
    j === 0 ? `Hero visual — ${title.slice(0, 72)}` : `Project photography — ${title.slice(0, 60)} (frame ${j + 1})`,
  );
}

export const PROJECT_DETAIL_MEDIA_BY_SLUG: Partial<Record<string, ProjectDetailMedia>> = {};

export function getProjectDetailMediaForSlug(slug: string): ProjectDetailMedia {
  return PROJECT_DETAIL_MEDIA_BY_SLUG[slug] ?? {};
}

export function getProjectArticle(
  project: ProjectEntry,
  architect?: ArchitectProfile,
  mediaFromAdmin?: ProjectDetailMedia | null,
): ProjectArticle {
  const fromMap = getProjectDetailMediaForSlug(project.slug);
  const mediaMerged: ProjectDetailMedia = mediaFromAdmin != null ? { ...fromMap, ...mediaFromAdmin } : fromMap;

  const lf = getProjectLongForm(project.slug);
  let dek: string;
  let paragraphs: string[];
  let specs: BuildSpec[];
  let faq: { question: string; answer: string }[];
  let seo: ProjectSeoMeta | null;
  let imageAlts: string[];

  if (lf) {
    dek = sanitizeExcerpt(lf.dek);
    paragraphs = lf.paragraphs;
    specs = [...baseSpecs(project, architect), ...(lf.extraSpecs ?? [])];
    faq = lf.faq;
    seo = lf.seo;
    imageAlts = lf.imageAlts;
  } else {
    dek = sanitizeExcerpt(project.excerpt);
    paragraphs = fallbackParagraphs(project, architect);
    specs = baseSpecs(project, architect);
    faq = [];
    seo = {
      title: `${project.title} | Projects | the9thedition`,
      description: project.excerpt.slice(0, 160),
      keywords: [project.category, project.projectType, "architecture India", "the9thedition"],
      geo_region: project.location ?? "India",
    };
    imageAlts = defaultImageAlts(project.title);
  }

  paragraphs = ensureLengthBetween500And700(project, paragraphs, architect, seo?.geo_region);

  const youtubeFromLongForm = lf?.youtubeUrl;
  const videoUrl = mediaMerged.videoUrl?.trim() || youtubeFromLongForm;

  const gallery = catalogProjectGalleryPaths(project.slug);

  return stripInternalCatalogCopy({
    dek,
    paragraphs,
    specs,
    gallery,
    imageAlts,
    faq,
    seo,
    media: {
      ...mediaMerged,
      ...(videoUrl ? { videoUrl } : {}),
    },
  });
}
