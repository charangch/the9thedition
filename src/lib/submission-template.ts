import { z } from "zod";

export function countWords(input: string): number {
  return input
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

export const submissionFormSchema = z.object({
  projectName: z.string().trim().min(2).max(200),
  architectureFirm: z.string().trim().min(2).max(200),
  website: z.string().url().optional().or(z.literal("")),
  contactEmail: z.string().email(),
  firmLocation: z.string().trim().min(2).max(240),

  isCompetitionEntry: z.boolean().default(false),
  competitionName: z.string().trim().max(200).optional().or(z.literal("")),
  competitionWebsite: z.string().url().optional().or(z.literal("")),
  willBeRealized: z.enum(["yes", "no", "unknown"]).default("unknown"),
  completionYear: z.string().trim().max(40).optional().or(z.literal("")),
  grossBuiltArea: z.string().trim().max(120).optional().or(z.literal("")),
  projectLocation: z.string().trim().min(2).max(240),
  leadArchitects: z.string().trim().min(2).max(300),
  leadArchitectsEmail: z.string().email(),

  renderCredits: z.string().trim().max(400).optional().or(z.literal("")),
  videoLink: z.string().url().optional().or(z.literal("")),

  designTeam: z.string().trim().max(500).optional().or(z.literal("")),
  clients: z.string().trim().max(300).optional().or(z.literal("")),
  engineering: z.string().trim().max(300).optional().or(z.literal("")),
  landscape: z.string().trim().max(300).optional().or(z.literal("")),
  consultants: z.string().trim().max(300).optional().or(z.literal("")),
  collaborators: z.string().trim().max(300).optional().or(z.literal("")),
  additionalCreditsEtc: z.string().trim().max(600).optional().or(z.literal("")),

  shortText: z
    .string()
    .trim()
    .refine((v) => countWords(v) <= 80, "Short text must be 80 words or fewer."),
  longText: z
    .string()
    .trim()
    .refine((v) => {
      const words = countWords(v);
      return words >= 200 && words <= 500;
    }, "Long text must be between 200 and 500 words."),
  coverImageUrl: z.string().url().optional().or(z.literal("")),
  imageCaptions: z.array(z.string().max(300)).max(25).optional(),
});

export type SubmissionFormData = z.infer<typeof submissionFormSchema>;

export function slugifyProject(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 140);
}
