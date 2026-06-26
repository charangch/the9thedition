import { z } from "zod";

export const PROJECT_CATEGORIES = [
  "Architecture & Design",
  "Decorating",
  "Lifestyle",
  "Celebrity",
  "Culture",
  "Professionals",
] as const;

export const PROJECT_TYPES = [
  "Residential",
  "Editorial",
  "Commercial",
  "Hospitality",
  "Cultural",
  "Interior",
  "Landscape",
] as const;

const optionalUrl = z.union([z.literal(""), z.string().url()]);

const socialSchema = z.object({
  website: optionalUrl.optional(),
  instagram: optionalUrl.optional(),
  facebook: optionalUrl.optional(),
  youtube: optionalUrl.optional(),
});

const faqSchema = z
  .array(
    z.object({
      question: z.string().trim().min(4).max(300),
      answer: z.string().trim().min(4).max(1200),
    }),
  )
  .max(6);

const sharedFields = {
  projectName: z.string().trim().min(1, "Project title is required").max(200),
  slug: z.string().trim().max(140).optional().or(z.literal("")),
  architectMode: z.enum(["existing", "new"]),
  professionalId: z.string().uuid().optional().or(z.literal("")),
  architectStaticSlug: z.string().trim().max(140).optional().or(z.literal("")),
  architectureFirm: z.string().trim().max(200).optional().or(z.literal("")),
  leadArchitect: z.string().trim().max(200).optional().or(z.literal("")),
  professionalSocials: socialSchema.optional(),
  professionalImageUrl: optionalUrl.optional(),
  category: z.string().trim().min(1).max(120),
  projectType: z.string().trim().min(1).max(120),
  projectLocation: z.string().trim().max(240).optional().or(z.literal("")),
  grossBuiltArea: z.string().trim().max(120).optional().or(z.literal("")),
  completionYear: z.string().trim().max(40).optional().or(z.literal("")),
  manufacturers: z.string().trim().max(500).optional().or(z.literal("")),
  climateStrategy: z.string().trim().max(400).optional().or(z.literal("")),
  primaryMaterials: z.string().trim().max(400).optional().or(z.literal("")),
  imageryNote: z.string().trim().max(500).optional().or(z.literal("")),
  galleryUrls: z.array(z.string().url()).max(25).optional(),
  videoUrl: optionalUrl.optional(),
  faq: faqSchema.optional(),
};

/** Save draft — only title required; hero and copy can be finished later. */
export const projectPublishDraftSchema = z.object({
  ...sharedFields,
  dek: z.string().trim().max(600).optional().or(z.literal("")),
  narrative: z.string().trim().optional().or(z.literal("")),
  coverImageUrl: optionalUrl.optional(),
});

/** Publish — full editorial requirements. */
export const projectPublishFormSchema = z.object({
  ...sharedFields,
  architectureFirm: z.string().trim().min(2, "Architecture firm is required"),
  leadArchitect: z.string().trim().min(1, "Lead architect is required"),
  projectLocation: z.string().trim().min(2, "Location is required"),
  dek: z.string().trim().min(10, "Lead paragraph needs at least 10 characters"),
  narrative: z.string().trim().min(40, "Narrative needs at least 40 characters"),
  coverImageUrl: z.string().url("Upload a hero image or paste a valid image URL"),
  faq: faqSchema.min(1).optional(),
});

export type ProjectPublishForm = z.infer<typeof projectPublishFormSchema>;
export type ProjectPublishDraft = z.infer<typeof projectPublishDraftSchema>;

export const emptyProjectPublishForm = (): ProjectPublishDraft => ({
  projectName: "",
  slug: "",
  architectMode: "new",
  professionalId: "",
  architectStaticSlug: "",
  architectureFirm: "",
  leadArchitect: "",
  professionalSocials: { website: "", instagram: "", facebook: "", youtube: "" },
  professionalImageUrl: "",
  category: "Architecture & Design",
  projectType: "Residential",
  projectLocation: "",
  grossBuiltArea: "",
  completionYear: "",
  manufacturers:
    "Stone, lime, timber and glazing per narrative; verify submittals for your site.",
  climateStrategy: "",
  primaryMaterials: "",
  imageryNote: "",
  dek: "",
  narrative: "",
  coverImageUrl: "",
  galleryUrls: [],
  videoUrl: "",
  faq: [
    {
      question: "What is this project about?",
      answer: "Editorial documentation on the9thedition with build details and photography from the design team.",
    },
  ],
});

export function formFromPublishedRow(row: {
  slug: string;
  title: string;
  form_data?: Record<string, unknown> | null;
  image_urls?: string[];
  video_links?: string[];
  hero_image_url?: string | null;
  location?: string | null;
  category?: string | null;
  excerpt?: string | null;
  content?: string | null;
}): ProjectPublishDraft {
  const f = (row.form_data ?? {}) as Record<string, unknown>;
  const images = row.image_urls ?? [];
  const hero = String(row.hero_image_url ?? f.coverImageUrl ?? images[0] ?? "");
  const base = formFromQueueRow({
    title: row.title,
    form_data: f,
    image_urls: images,
    video_links: row.video_links,
    published_slug: row.slug,
  });
  return {
    ...base,
    projectName: String(f.projectName ?? row.title),
    slug: row.slug,
    projectLocation: String(f.projectLocation ?? row.location ?? ""),
    dek: String(f.dek ?? f.shortText ?? row.excerpt ?? ""),
    narrative: String(f.narrative ?? f.longText ?? row.content ?? ""),
    category: String(f.category ?? row.category ?? base.category),
    coverImageUrl: hero,
    galleryUrls: images.filter((u) => u !== hero),
  };
}

export function formFromQueueRow(row: {
  title?: string;
  form_data?: Record<string, unknown> | null;
  image_urls?: string[];
  video_links?: string[];
  published_slug?: string | null;
}): ProjectPublishDraft {
  const f = (row.form_data ?? {}) as Record<string, unknown>;
  const base = emptyProjectPublishForm();
  const faqRaw = f.faq;
  const socialsRaw = f.professionalSocials as Record<string, string> | undefined;
  const images = row.image_urls ?? [];
  const hero = String(f.coverImageUrl ?? images[0] ?? "");

  return {
    ...base,
    projectName: String(f.projectName ?? row.title ?? ""),
    slug: String(f.slug ?? row.published_slug ?? ""),
    architectMode: (f.architectMode as ProjectPublishDraft["architectMode"]) ?? "new",
    professionalId: String(f.professionalId ?? ""),
    architectStaticSlug: String(f.architectStaticSlug ?? ""),
    architectureFirm: String(f.architectureFirm ?? ""),
    leadArchitect: String(f.leadArchitect ?? f.leadArchitects ?? ""),
    professionalSocials: {
      website: socialsRaw?.website ?? "",
      instagram: socialsRaw?.instagram ?? "",
      facebook: socialsRaw?.facebook ?? "",
      youtube: socialsRaw?.youtube ?? "",
    },
    professionalImageUrl: String(f.professionalImageUrl ?? ""),
    category: String(f.category ?? base.category),
    projectType: String(f.projectType ?? "Residential"),
    projectLocation: String(f.projectLocation ?? ""),
    grossBuiltArea: String(f.grossBuiltArea ?? ""),
    completionYear: String(f.completionYear ?? ""),
    manufacturers: String(f.manufacturers ?? base.manufacturers),
    climateStrategy: String(f.climateStrategy ?? ""),
    primaryMaterials: String(f.primaryMaterials ?? ""),
    imageryNote: String(f.imageryNote ?? base.imageryNote),
    dek: String(f.dek ?? f.shortText ?? ""),
    narrative: String(f.narrative ?? f.longText ?? ""),
    coverImageUrl: hero,
    galleryUrls: images.filter((u) => u !== hero),
    videoUrl: String(f.videoUrl ?? f.videoLink ?? row.video_links?.[0] ?? ""),
    faq: Array.isArray(faqRaw) && faqRaw.length ? (faqRaw as ProjectPublishDraft["faq"]) : base.faq,
  };
}

/** Human-readable validation messages for the admin UI. */
export function formatZodIssues(error: z.ZodError): string {
  return error.issues
    .map((issue) => {
      const path = issue.path.join(" · ") || "form";
      return `${path}: ${issue.message}`;
    })
    .join("\n");
}

export function validatePublishForm(form: ProjectPublishDraft): { ok: true } | { ok: false; message: string } {
  const parsed = projectPublishFormSchema.safeParse(form);
  if (parsed.success) return { ok: true };
  return { ok: false, message: formatZodIssues(parsed.error) };
}
