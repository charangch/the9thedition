import type { EditorialStory } from "@/lib/content";
import {
  featuredStories,
  projectSpotlights,
  secondaryLeadStories,
  sectionStories,
} from "@/lib/content";

export type ProjectEntry = EditorialStory & {
  slug: string;
  /** Matches `ArchitectProfile.slug` in `@/lib/architects`. */
  architectSlug: string;
  /** Used with `category` to surface related projects (e.g. Residential, Interior, Cultural). */
  projectType: string;
};

function entry(slug: string, story: EditorialStory, architectSlug: string, projectType: string): ProjectEntry {
  return {
    ...story,
    slug,
    architectSlug,
    projectType,
    image: `/api/generated-image?c=projects&k=${encodeURIComponent(slug)}&i=0`,
  };
}

/** All projects with detail pages at `/projects/[slug]` — same set used on homepage and `/projects`. */
export const projectCatalog: ProjectEntry[] = [
  entry("hyderabad-climate-smart-residence", featuredStories[0]!, "iki-builds", "Residential"),
  entry("kochi-courtyard-craft-memory", featuredStories[1]!, "temple-town", "Residential"),
  entry("interiors-texture-light-silence", featuredStories[2]!, "lyth-design", "Interior"),
  entry("alibag-nine-courtyards", featuredStories[3]!, "studio-momo", "Residential"),
  entry("kottayam-sun-shade-vernacular", featuredStories[4]!, "temple-town", "Residential"),
  entry("bengaluru-mexican-palette-brutalism", featuredStories[5]!, "soul-space", "Interior"),
  entry("designer-directory-hospitality-interiors", featuredStories[6]!, "the9thedition-editorial", "Editorial"),
  entry("thrissur-forest-bungalow-mango", projectSpotlights[0]!, "naked-volume", "Residential"),
  entry("pawna-weekend-rustic-stone", projectSpotlights[1]!, "nacl-studio", "Residential"),
  entry("jaipur-haveli-modern-life", projectSpotlights[2]!, "studio-momo", "Residential"),
  entry("khar-west-fluid-interiors", projectSpotlights[3]!, "the-last-goldfish", "Interior"),
  entry("chennai-coastal-villa-verandahs", projectSpotlights[4]!, "iki-builds", "Residential"),
  entry("rajapalayam-farmhouse-generations", projectSpotlights[5]!, "naked-volume", "Residential"),
  entry("birdhouses-kutch-community-towers", secondaryLeadStories[0]!, "the9thedition-editorial", "Cultural"),
  entry("courtyards-tropical-luxury-homes", secondaryLeadStories[1]!, "iki-builds", "Editorial"),
  entry("celebrity-homes-art-decisions", secondaryLeadStories[2]!, "the9thedition-editorial", "Editorial"),
  entry("temple-architecture-modern-gallery", sectionStories.culture[0]! as EditorialStory, "the9thedition-editorial", "Cultural"),
  entry("portrait-artist-studios", sectionStories.culture[1]! as EditorialStory, "the9thedition-editorial", "Cultural"),
  entry("biennale-cities-design-destinations", sectionStories.culture[2]! as EditorialStory, "the9thedition-editorial", "Editorial"),
];

const bySlug = new Map(projectCatalog.map((p) => [p.slug, p]));

export function getProjectBySlug(slug: string): ProjectEntry | undefined {
  return bySlug.get(slug);
}

export function getAllProjects(): ProjectEntry[] {
  return projectCatalog;
}

export function getProjectsByArchitectSlug(architectSlug: string): ProjectEntry[] {
  return projectCatalog.filter((p) => p.architectSlug === architectSlug);
}

/**
 * Related catalog projects: same category + type, then same category, then same architect,
 * then the rest of the catalog. Up to `max` items (aim for 9+ when the catalog is large enough).
 */
export function getRelatedProjects(current: ProjectEntry, max = 24): ProjectEntry[] {
  const all = projectCatalog.filter((p) => p.slug !== current.slug);
  const ordered: ProjectEntry[] = [];
  const push = (candidates: ProjectEntry[]) => {
    for (const p of candidates) {
      if (ordered.length >= max) return;
      if (ordered.some((x) => x.slug === p.slug)) continue;
      ordered.push(p);
    }
  };
  push(all.filter((p) => p.category === current.category && p.projectType === current.projectType));
  push(all.filter((p) => p.category === current.category));
  push(all.filter((p) => p.architectSlug === current.architectSlug));
  push(all);
  return ordered;
}

export function getAllProjectSlugs(): string[] {
  return projectCatalog.map((p) => p.slug);
}

/** Slugs aligned with `featuredStories` order (7). */
export const featuredStorySlugs = projectCatalog.slice(0, 7).map((p) => p.slug);

/** Slugs aligned with `projectSpotlights` order (6). */
export const projectSpotlightSlugs = projectCatalog.slice(7, 13).map((p) => p.slug);

export function getSectionStoriesResolved(): {
  homes: ProjectEntry[];
  projects: ProjectEntry[];
  culture: ProjectEntry[];
} {
  return {
    homes: featuredStorySlugs.slice(0, 4).map((s) => bySlug.get(s)!),
    projects: projectSpotlightSlugs.slice(0, 4).map((s) => bySlug.get(s)!),
    culture: [
      "temple-architecture-modern-gallery",
      "portrait-artist-studios",
      "biennale-cities-design-destinations",
    ].map((s) => bySlug.get(s)!),
  };
}

/** One featured project per top-level category (for homepage “Projects by Category”). */
export const projectsByCategory: { category: string; slug: string }[] = [
  { category: "Architecture & Design", slug: "hyderabad-climate-smart-residence" },
  { category: "Decorating", slug: "interiors-texture-light-silence" },
  { category: "Lifestyle", slug: "pawna-weekend-rustic-stone" },
  { category: "Celebrity", slug: "celebrity-homes-art-decisions" },
  { category: "Culture", slug: "temple-architecture-modern-gallery" },
];
