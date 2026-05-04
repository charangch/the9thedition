import { slugifyProject } from "@/lib/submission-template";

export type PublishingContentType = "project" | "student";

export type PublishingFormData = {
  projectName: string;
  architectureFirm: string;
  website: string;
  contactEmail: string;
  firmLocation: string;
  isCompetitionEntry: boolean;
  competitionName: string;
  competitionWebsite: string;
  willBeRealized: "yes" | "no" | "unknown";
  completionYear: string;
  grossBuiltArea: string;
  projectLocation: string;
  leadArchitects: string;
  leadArchitectsEmail: string;
  renderCredits: string;
  videoLink: string;
  designTeam: string;
  clients: string;
  engineering: string;
  landscape: string;
  consultants: string;
  collaborators: string;
  additionalCreditsEtc: string;
  shortText: string;
  longText: string;
  coverImageUrl: string;
  imageCaptions: string[];
};

type ParsedResult = {
  title: string;
  longText: string;
  formData: PublishingFormData;
  slug: string;
};

const FIELD_LABELS: Record<string, string[]> = {
  projectName: ["Project Name", "Title"],
  architectureFirm: ["Architecture Firm", "Firm"],
  website: ["Website", "Project Website"],
  contactEmail: ["Contact e-mail", "Contact email"],
  firmLocation: ["Firm Location"],
  competitionName: ["Competition name"],
  competitionWebsite: ["Competition website"],
  completionYear: ["Completion Year", "Completion Year (if applies)"],
  grossBuiltArea: ["Gross Built Area"],
  projectLocation: ["Project location"],
  leadArchitects: ["Lead Architects"],
  leadArchitectsEmail: ["Lead Architects e-mail", "Lead Architects email"],
  renderCredits: ["Renderings credits"],
  videoLink: ["Video link"],
  designTeam: ["Design Team"],
  clients: ["Clients"],
  engineering: ["Engineering"],
  landscape: ["Landscape"],
  consultants: ["Consultants"],
  collaborators: ["Collaborators"],
  additionalCreditsEtc: ["Etc", "Additional Credits"],
};

function extractByLabels(input: string, labels: string[]): string {
  for (const label of labels) {
    const pattern = new RegExp(`${label}\\s*:\\s*(.+)$`, "gim");
    const match = pattern.exec(input);
    if (match?.[1]) {
      return match[1].trim();
    }
  }
  return "";
}

function words(input: string): string[] {
  return input.trim().split(/\s+/).filter(Boolean);
}

function firstWords(input: string, count: number): string {
  return words(input).slice(0, count).join(" ");
}

export function emptyPublishingFormData(): PublishingFormData {
  return {
    projectName: "",
    architectureFirm: "",
    website: "",
    contactEmail: "",
    firmLocation: "",
    isCompetitionEntry: false,
    competitionName: "",
    competitionWebsite: "",
    willBeRealized: "unknown",
    completionYear: "",
    grossBuiltArea: "",
    projectLocation: "",
    leadArchitects: "",
    leadArchitectsEmail: "",
    renderCredits: "",
    videoLink: "",
    designTeam: "",
    clients: "",
    engineering: "",
    landscape: "",
    consultants: "",
    collaborators: "",
    additionalCreditsEtc: "",
    shortText: "",
    longText: "",
    coverImageUrl: "",
    imageCaptions: [],
  };
}

export function parsePublishingSource(sourceText: string): ParsedResult {
  const base = emptyPublishingFormData();
  const normalized = sourceText.trim();
  const parsed = {
    ...base,
    projectName: extractByLabels(normalized, FIELD_LABELS.projectName),
    architectureFirm: extractByLabels(normalized, FIELD_LABELS.architectureFirm),
    website: extractByLabels(normalized, FIELD_LABELS.website),
    contactEmail: extractByLabels(normalized, FIELD_LABELS.contactEmail),
    firmLocation: extractByLabels(normalized, FIELD_LABELS.firmLocation),
    competitionName: extractByLabels(normalized, FIELD_LABELS.competitionName),
    competitionWebsite: extractByLabels(normalized, FIELD_LABELS.competitionWebsite),
    completionYear: extractByLabels(normalized, FIELD_LABELS.completionYear),
    grossBuiltArea: extractByLabels(normalized, FIELD_LABELS.grossBuiltArea),
    projectLocation: extractByLabels(normalized, FIELD_LABELS.projectLocation),
    leadArchitects: extractByLabels(normalized, FIELD_LABELS.leadArchitects),
    leadArchitectsEmail: extractByLabels(normalized, FIELD_LABELS.leadArchitectsEmail),
    renderCredits: extractByLabels(normalized, FIELD_LABELS.renderCredits),
    videoLink: extractByLabels(normalized, FIELD_LABELS.videoLink),
    designTeam: extractByLabels(normalized, FIELD_LABELS.designTeam),
    clients: extractByLabels(normalized, FIELD_LABELS.clients),
    engineering: extractByLabels(normalized, FIELD_LABELS.engineering),
    landscape: extractByLabels(normalized, FIELD_LABELS.landscape),
    consultants: extractByLabels(normalized, FIELD_LABELS.consultants),
    collaborators: extractByLabels(normalized, FIELD_LABELS.collaborators),
    additionalCreditsEtc: extractByLabels(normalized, FIELD_LABELS.additionalCreditsEtc),
  };

  const lowercase = normalized.toLowerCase();
  parsed.isCompetitionEntry = lowercase.includes("competition entry?: yes");
  parsed.willBeRealized = lowercase.includes("will your project be realized?: yes")
    ? "yes"
    : lowercase.includes("will your project be realized?: no")
      ? "no"
      : "unknown";

  const defaultLong = normalized || "Editorial content pending.";
  const longText = parsed.longText || defaultLong;
  const shortText = firstWords(longText, 80);
  const title = parsed.projectName || "Untitled entry";
  return {
    title,
    longText,
    slug: slugifyProject(title),
    formData: {
      ...parsed,
      shortText,
      longText,
    },
  };
}
