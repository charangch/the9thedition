import type { EditorialProjectDocument } from "@/lib/editorial/types";
import { emptyEditorialDocument } from "@/lib/editorial/types";
import type { SubmissionFormData } from "@/lib/submission-template";

/** Build editorial payload from legacy queue row fields. */
export function editorialFromQueueRow(row: {
  form_data?: Partial<SubmissionFormData> | Record<string, unknown> | null;
  editorial_payload?: unknown;
  source_text?: string;
  image_urls?: string[];
  video_links?: string[];
  taxonomy_name?: string | null;
  is_trending?: boolean;
}): EditorialProjectDocument {
  const stored =
    row.editorial_payload && typeof row.editorial_payload === "object" && !Array.isArray(row.editorial_payload)
      ? (row.editorial_payload as EditorialProjectDocument)
      : null;
  if (stored?.generalInfo) return stored;

  const form = (row.form_data ?? {}) as Partial<SubmissionFormData>;
  const images = row.image_urls ?? [];
  const base = emptyEditorialDocument();
  return {
    ...base,
    content: {
      summary: form.shortText,
      narrative: form.longText ?? row.source_text,
    },
    generalInfo: {
      ...base.generalInfo,
      completionYear: form.completionYear,
      builtArea: form.grossBuiltArea,
      projectLocation: form.projectLocation,
      leadArchitects: form.architectureFirm ? [form.architectureFirm] : [],
    },
    media: {
      heroImage: form.coverImageUrl
        ? { url: form.coverImageUrl }
        : images[0]
          ? { url: images[0] }
          : null,
      galleryImages: images.map((url, i) => ({
        id: `img-${i}`,
        url,
        order: i,
      })),
      drawings: [],
      videoUrl: row.video_links?.[0],
    },
    metadata: {
      ...base.metadata,
      featuredOnHomepage: Boolean(row.is_trending),
    },
    teamAndCredits: {
      designTeam: row.taxonomy_name ? [row.taxonomy_name] : [],
    },
  };
}

export function formDataFromEditorial(doc: EditorialProjectDocument, title: string): Partial<SubmissionFormData> {
  const firm = doc.generalInfo.leadArchitects?.[0] ?? "";
  return {
    projectName: title,
    architectureFirm: firm,
    projectLocation: doc.generalInfo.projectLocation,
    completionYear: doc.generalInfo.completionYear,
    grossBuiltArea: doc.generalInfo.builtArea,
    shortText: doc.content.summary,
    longText: doc.content.narrative,
    coverImageUrl: doc.media.heroImage?.url,
  };
}
