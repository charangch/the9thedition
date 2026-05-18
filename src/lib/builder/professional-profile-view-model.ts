import { getArchitectBySlug } from "@/lib/architects";
import type { PublishedProject } from "@/lib/published-projects";
import {
  getPublishedProjectsByArchitectureFirm,
  getPublishedProjectsByProfessionalId,
} from "@/lib/published-projects";
import { getProfessionalBySlug } from "@/lib/professionals-db";
import type { ProjectEntry } from "@/lib/project-catalog";
import { getProjectsByArchitectSlug } from "@/lib/project-catalog";

function professionalImageFromPublished(projects: PublishedProject[]): string | undefined {
  for (const project of projects) {
    const form = project.form_data as Record<string, unknown> | null;
    const fromForm = typeof form?.professionalImageUrl === "string" ? form.professionalImageUrl.trim() : "";
    if (fromForm) return fromForm;
  }
  return undefined;
}

export type ProfessionalProfileViewModel = {
  slug: string;
  firm: string;
  name: string;
  bio: string;
  image?: string;
  website?: string | null;
  instagram?: string | null;
  facebook?: string | null;
  youtube?: string | null;
  catalogProjects: ProjectEntry[];
  publishedProjects: PublishedProject[];
};

export async function buildProfessionalProfileViewModel(slug: string): Promise<ProfessionalProfileViewModel | null> {
  const dbProfessional = await getProfessionalBySlug(slug);
  const staticArchitect = getArchitectBySlug(slug);
  const architect = dbProfessional
    ? {
        slug: dbProfessional.slug,
        name: dbProfessional.name,
        firm: dbProfessional.firm,
        bio: dbProfessional.bio ?? "",
        image: dbProfessional.image_url ?? undefined,
      }
    : staticArchitect;
  if (!architect) return null;

  const projects = getProjectsByArchitectSlug(slug);
  const publishedProjects = dbProfessional
    ? await getPublishedProjectsByProfessionalId(dbProfessional.id, 24)
    : await getPublishedProjectsByArchitectureFirm(architect.firm, 12);

  const image =
    dbProfessional?.image_url?.trim() ||
    staticArchitect?.image ||
    professionalImageFromPublished(publishedProjects) ||
    architect.image;

  return {
    slug: architect.slug,
    firm: architect.firm,
    name: architect.name,
    bio: architect.bio,
    image: image || undefined,
    website: dbProfessional?.website ?? null,
    instagram: dbProfessional?.instagram_url ?? null,
    facebook: dbProfessional?.facebook_url ?? null,
    youtube: dbProfessional?.youtube_url ?? null,
    catalogProjects: projects,
    publishedProjects,
  };
}
