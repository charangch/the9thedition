export type FaqItem = { question: string; answer: string };

/** AI SEO / GEO / AEO filler that should not appear in reader-facing copy. */
export const EDITORIAL_FILLER_PATTERN =
  /\b(SEO|GEO|AEO)\b|on-site procedural|on-site generated|answer engine|answer engines|search and answer|image SEO|procedural graphics|structured metadata|structured editorial brief|structured narratives|geographic discovery|geographic signals|disciplinary discovery|geographic context|optimized for (search|discovery|answer)|structured for search|for discovery across|editorial metadata for SEO|Top 100 dossier|in the Top 100|ranked roadmap|GEO-tagged|how should i cite|how do i reference|verify against local codes|verify critical facts|cross-check with your local codes|climate datasets for specification|dossier on performance|dossier emphasize|Editorial film selection|Reader save disabled|Public reader accounts|summarized for discovery|citation in research workflows|deterministic on-site graphics|generated for layout and SEO|editorial notes, imagery, and build details|for research and precedent study|briefing companion|reliable editorial summary|layout and SEO/i;

const FAQ_QUESTION_FILLER_PATTERN =
  /^(SEO|GEO|AEO)\b|top 100|how should i cite|how do i reference|geographic signals|which region does this dossier|why is this project in the|cultural seo keywords|geo keywords|geo focus|geo notes|seo intent|aeo checklist|what is this archive project about|who should read this page|who is the intended reader|who is this article for|how should teams apply this information|are images photographs|what is this architects article about|what is this update about regarding/i;

export function isEditorialFiller(text: string): boolean {
  const t = text.trim();
  if (!t) return true;
  return EDITORIAL_FILLER_PATTERN.test(t) || FAQ_QUESTION_FILLER_PATTERN.test(t);
}

export function sanitizeExcerpt(text: string): string {
  let s = text.trim();
  if (!s) return "";

  // Archive / list templates: "Category — documented … for research and precedent study."
  s = s.replace(/\s*—\s*documented .+$/i, "");
  // Title repeat + colon dossier line (Top 100 style)
  s = s.replace(/:\s*(a\s+)?Top\s+100\s+dossier.*$/i, "");
  s = s.replace(/:\s*a\s+dossier on.*$/i, "");
  // Em-dash SEO tails
  s = s.replace(/\s*[—–]\s*(a\s+)?Top\s+100\s+dossier.*$/i, "");
  s = s.replace(/\s*[—–]\s*optimized for search.*$/i, "");
  s = s.replace(/\s*…\s*A structured editorial brief.*$/i, "");
  s = s.replace(/\s*—optimized for search and answer engines\.?$/i, "");
  s = s.replace(/\s+for (search|discovery|answer engines).*$/i, "");
  // Truncate at ellipsis boilerplate
  if (s.includes("…")) {
    s = s.split("…")[0]!.trim();
  }

  if (isEditorialFiller(s)) {
    const first = s.split(/[.!?]/)[0]?.trim();
    return first ? `${first}.` : "";
  }
  return s.trim();
}

export function sanitizeBodyText(body: string): string {
  return body
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter((p) => p && !isEditorialFiller(p))
    .join("\n\n");
}

export function sanitizeFaq<T extends FaqItem>(faq: T[]): T[] {
  return faq.filter((item) => !isEditorialFiller(item.question) && !isEditorialFiller(item.answer));
}
