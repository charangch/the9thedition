import type { EditorialStory } from "@/lib/content";

export type ProjectEntry = EditorialStory & {
  slug: string;
  /** Matches `ArchitectProfile.slug` in `@/lib/architects`. */
  architectSlug: string;
  /** Used with `category` to surface related projects (e.g. Residential, Interior, Cultural). */
  projectType: string;
};
