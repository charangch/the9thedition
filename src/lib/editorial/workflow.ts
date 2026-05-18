import type { EditorialProjectDocument, EditorialStatus } from "@/lib/editorial/types";

export type PublishValidationResult =
  | { ok: true }
  | { ok: false; errors: string[] };

export function canTransition(from: EditorialStatus, to: EditorialStatus): boolean {
  if (from === to) return true;
  if (from === "deleted") return false;
  if (to === "deleted") return true;
  if (to === "archived") return from === "published" || from === "ready" || from === "review";
  if (to === "published") return from === "ready" || from === "review" || from === "published";
  if (to === "ready") return from === "review" || from === "draft" || from === "ready";
  if (to === "review") return from === "draft" || from === "review";
  if (to === "draft") return from !== "published";
  return true;
}

export function validateForPublish(doc: EditorialProjectDocument, professionalAssigned: boolean): PublishValidationResult {
  const errors: string[] = [];
  if (!doc.content.narrative?.trim()) errors.push("Narrative is required.");
  if (!doc.media.heroImage?.url?.trim()) errors.push("Hero image is required.");
  if (!professionalAssigned) errors.push("Assign a professional / studio.");
  if (!doc.rightsAndTerms.rightsConfirmation) errors.push("Rights confirmation must be checked.");
  return errors.length ? { ok: false, errors } : { ok: true };
}

export function mergeEditorialPayload(
  existing: unknown,
  patch: Partial<EditorialProjectDocument>,
): EditorialProjectDocument {
  const base =
    existing && typeof existing === "object" && !Array.isArray(existing)
      ? (existing as EditorialProjectDocument)
      : ({} as EditorialProjectDocument);
  return {
    ...base,
    ...patch,
    generalInfo: { ...base.generalInfo, ...patch.generalInfo },
    media: {
      ...base.media,
      ...patch.media,
      galleryImages: patch.media?.galleryImages ?? base.media?.galleryImages ?? [],
      drawings: patch.media?.drawings ?? base.media?.drawings ?? [],
    },
    content: { ...base.content, ...patch.content },
    teamAndCredits: { ...base.teamAndCredits, ...patch.teamAndCredits },
    rightsAndTerms: { ...base.rightsAndTerms, ...patch.rightsAndTerms },
    metadata: { ...base.metadata, ...patch.metadata },
  };
}
