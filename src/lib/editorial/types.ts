/** Editorial document stored in `admin_publishing_queue.editorial_payload` (+ mirrored fields on publish). */

export const EDITORIAL_STATUSES = [
  "draft",
  "review",
  "ready",
  "published",
  "archived",
  "deleted",
] as const;

export type EditorialStatus = (typeof EDITORIAL_STATUSES)[number];

/** Legacy DB rows may still use `pending` — treat as draft in the app layer. */
export function normalizeQueueStatus(raw: string): EditorialStatus {
  if (raw === "pending") return "draft";
  if ((EDITORIAL_STATUSES as readonly string[]).includes(raw)) return raw as EditorialStatus;
  return "draft";
}

export type HeroImageAsset = {
  url: string;
  focalPoint?: { x: number; y: number };
  caption?: string;
  credit?: string;
};

export type GalleryImageAsset = {
  id: string;
  url: string;
  order: number;
  caption?: string;
  credit?: string;
  isFeatured?: boolean;
};

export type DrawingAsset = {
  url: string;
  caption?: string;
  credit?: string;
};

export type EditorialProjectDocument = {
  submissionSource?: string;
  generalInfo: {
    officeId?: string | null;
    officeWebsite?: string;
    contactEmail?: string;
    officeLocation?: string;
    competitionEntry?: boolean;
    willBeBuilt?: boolean;
    completionYear?: string;
    builtArea?: string;
    projectLocation?: string;
    leadArchitects?: string[];
    leadArchitectsEmail?: string;
  };
  media: {
    heroImage?: HeroImageAsset | null;
    galleryImages: GalleryImageAsset[];
    drawings: DrawingAsset[];
    videoUrl?: string;
  };
  content: {
    summary?: string;
    narrative?: string;
  };
  teamAndCredits: {
    designTeam?: string[];
    clientsDeveloper?: string[];
    consultants?: string[];
    landscapeArchitect?: string[];
    otherCollaborators?: string[];
  };
  rightsAndTerms: {
    acknowledgement?: boolean;
    rightsConfirmation?: boolean;
    internalAdminNotes?: string;
  };
  metadata: {
    category?: string;
    typology?: string;
    featuredOnHomepage?: boolean;
    publishDate?: string | null;
    deletedAt?: string | null;
    createdAt?: string;
    updatedAt?: string;
  };
};

export const emptyEditorialDocument = (): EditorialProjectDocument => ({
  submissionSource: "email_import",
  generalInfo: {
    leadArchitects: [],
    competitionEntry: false,
    willBeBuilt: true,
  },
  media: {
    galleryImages: [],
    drawings: [],
  },
  content: {},
  teamAndCredits: {},
  rightsAndTerms: {
    acknowledgement: true,
    rightsConfirmation: true,
  },
  metadata: {
    category: "Architecture & Design",
    featuredOnHomepage: false,
  },
});
