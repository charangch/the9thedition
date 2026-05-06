import sanitizeHtml from "sanitize-html";

const plainTextOptions = {
  allowedTags: [] as string[],
  allowedAttributes: {},
};

/**
 * Strip HTML/scripts and clamp length for safe plain-text storage and DB queries.
 */
export function sanitizePlainText(input: string, maxLen: number): string {
  const stripped = sanitizeHtml(input, plainTextOptions).trim().replace(/\s+/g, " ");
  return stripped.slice(0, maxLen);
}

/** Optional email: empty string becomes null; invalid emails should fail Zod earlier. */
export function sanitizeOptionalEmail(email: string | undefined | null): string | null {
  if (email == null) return null;
  const t = sanitizePlainText(email, 320);
  return t.length ? t : null;
}
