import type { ArchiveProject } from "@/lib/archive-projects";
import { getArchiveProjectBySlug, getRelatedArchiveProjects } from "@/lib/archive-projects";
import type { LayoutBlock } from "@/lib/layout-blocks";
import { normalizeLayoutBlocks } from "@/lib/layout-blocks";

export type ArchiveProjectViewModel = {
  item: ArchiveProject;
  related: ArchiveProject[];
  path: string;
  enquirySlug: string;
  editorialBlocks: LayoutBlock[];
  leadBlocks: LayoutBlock[];
};

export function buildArchiveProjectViewModel(slug: string, itemOverride?: ArchiveProject): ArchiveProjectViewModel | null {
  const item = itemOverride ?? getArchiveProjectBySlug(slug);
  if (!item) return null;
  const related = getRelatedArchiveProjects(item.slug, 4);
  const path = `/archive/${item.slug}`;
  const enquirySlug = `archive/${item.slug}`;
  const editorialBlocks: LayoutBlock[] = normalizeLayoutBlocks([
    {
      id: "arch-ed",
      type: "EditorialText",
      heading: "Archive narrative",
      body: item.content,
    },
  ]);
  const leadBlocks: LayoutBlock[] = normalizeLayoutBlocks([
    {
      id: "arch-lead",
      type: "LeadInquiryForm",
      heading: "Enquire about this project",
    },
  ]);
  return { item, related, path, enquirySlug, editorialBlocks, leadBlocks };
}
