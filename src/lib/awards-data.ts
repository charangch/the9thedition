/** Curated “Building of the Year” style winners — slugs must exist in `projectCatalog`. */
export const AWARDS_EDITION_YEAR = 2026;

export type AwardWinnerRow = {
  slug: string;
  /** Short category ribbon (ArchDaily-style). */
  awardCategory: string;
};

export const awardWinners: AwardWinnerRow[] = [
  { slug: "vela-house", awardCategory: "Housing" },
  { slug: "kurokawa-courtyard-house", awardCategory: "Houses" },
  { slug: "the-copper-passage", awardCategory: "Adaptive reuse" },
  { slug: "sierra-observatory-house", awardCategory: "Residential architecture" },
  { slug: "hotel-nott", awardCategory: "Hospitality architecture" },
  { slug: "maison-de-l-ombre", awardCategory: "Interior architecture" },
  { slug: "house-of-distant-dunes", awardCategory: "Desert architecture" },
  { slug: "valle-de-cobre", awardCategory: "Landscape architecture" },
  { slug: "house-between-gardens", awardCategory: "Courtyard housing" },
  { slug: "the-hollow-coast", awardCategory: "Coastal residential" },
  { slug: "casa-sombra", awardCategory: "Climate-resilient housing" },
  { slug: "above-the-silent-fjord", awardCategory: "Remote architecture" },
  { slug: "house-of-red-earth", awardCategory: "Heritage materials" },
  { slug: "canopy-void-house", awardCategory: "Tropical residential" },
  { slug: "house-above-the-canopy", awardCategory: "Editorial spotlight" },
];

export type StudentAwardSpotlight = {
  id: string;
  title: string;
  school: string;
  category: string;
};

export const studentAwardSpotlights: StudentAwardSpotlight[] = [
  {
    id: "student-tidal-learning-campus",
    title: "Tidal Learning Campus",
    school: "School of Planning & Architecture",
    category: "Climate-resilient campus",
  },
  {
    id: "student-modular-desert-hub",
    title: "Modular Desert Community Hub",
    school: "CEPT University",
    category: "Social infrastructure",
  },
  {
    id: "student-rewilded-transit",
    title: "Rewilded Transit Interchange",
    school: "IIT Roorkee Architecture",
    category: "Urban retrofit",
  },
];
