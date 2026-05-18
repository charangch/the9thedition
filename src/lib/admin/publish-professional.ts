import { getArchitectBySlug } from "@/lib/architects";
import { ensureProfessionalRow } from "@/lib/admin/ensure-professional";
import { createInsForgeServerClient } from "@/lib/insforge-server";
import type { ProfessionalRow } from "@/lib/professionals-db";
import { slugifyProject } from "@/lib/submission-template";
import type { ProjectPublishDraft } from "@/lib/admin/project-publish-schema";

export type ProfessionalSocials = {
  website?: string;
  instagram?: string;
  facebook?: string;
  youtube?: string;
};

export type ResolveProfessionalResult =
  | { ok: true; professional: ProfessionalRow }
  | { ok: false; message: string };

const professionalSelectBase = "id, slug, name, firm, bio, image_url";

export async function resolveProfessionalForPublish(
  accessToken: string,
  form: ProjectPublishDraft,
): Promise<ResolveProfessionalResult> {
  const socials = form.professionalSocials ?? {};

  if (form.architectStaticSlug?.trim()) {
    const catalog = getArchitectBySlug(form.architectStaticSlug.trim());
    if (!catalog) return { ok: false, message: "Selected directory architect was not found." };
    const imageOverride = form.professionalImageUrl?.trim();
    return ensureProfessionalRow(accessToken, catalog.slug, {
      name: catalog.name,
      firm: catalog.firm,
      bio: catalog.bio,
      image_url: imageOverride || catalog.image || null,
    });
  }

  if (form.architectMode === "existing" && form.professionalId) {
    const client = createInsForgeServerClient(accessToken);
    const { data, error } = await client.database
      .from("professionals")
      .select(professionalSelectBase)
      .eq("id", form.professionalId)
      .limit(1);
    if (error) return { ok: false, message: error.message };
    const row = Array.isArray(data) ? data[0] : data;
    if (!row) return { ok: false, message: "Selected architect profile was not found." };
    const imageOverride = form.professionalImageUrl?.trim();
    if (imageOverride) {
      const updated = await ensureProfessionalRow(accessToken, row.slug, { image_url: imageOverride });
      if (updated.ok) return updated;
    }
    return { ok: true, professional: row as ProfessionalRow };
  }

  const firm = (form.architectureFirm ?? "").trim();
  if (!firm) return { ok: false, message: "Architecture firm name is required." };
  const slug = slugifyProject(firm);
  const lead = (form.leadArchitect ?? "").trim() || firm;

  return ensureProfessionalRow(accessToken, slug, {
    name: lead,
    firm,
    image_url: form.professionalImageUrl?.trim() || null,
    website: socials.website?.trim() || null,
    instagram_url: socials.instagram?.trim() || null,
    facebook_url: socials.facebook?.trim() || null,
    youtube_url: socials.youtube?.trim() || null,
  });
}
