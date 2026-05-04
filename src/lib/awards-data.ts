/** Curated “Building of the Year” style winners — slugs must exist in `projectCatalog`. */
export const AWARDS_EDITION_YEAR = 2026;

export type AwardWinnerRow = {
  slug: string;
  /** Short category ribbon (ArchDaily-style). */
  awardCategory: string;
};

export const awardWinners: AwardWinnerRow[] = [
  { slug: "hyderabad-climate-smart-residence", awardCategory: "Housing" },
  { slug: "kochi-courtyard-craft-memory", awardCategory: "Houses" },
  { slug: "interiors-texture-light-silence", awardCategory: "Interior architecture" },
  { slug: "alibag-nine-courtyards", awardCategory: "Residential architecture" },
  { slug: "bengaluru-mexican-palette-brutalism", awardCategory: "Commercial & offices" },
  { slug: "temple-architecture-modern-gallery", awardCategory: "Cultural architecture" },
  { slug: "birdhouses-kutch-community-towers", awardCategory: "Public & landscape" },
  { slug: "pawna-weekend-rustic-stone", awardCategory: "Hospitality architecture" },
  { slug: "jaipur-haveli-modern-life", awardCategory: "Heritage & adaptive reuse" },
  { slug: "thrissur-forest-bungalow-mango", awardCategory: "Houses" },
  { slug: "kottayam-sun-shade-vernacular", awardCategory: "Climate-resilient housing" },
  { slug: "chennai-coastal-villa-verandahs", awardCategory: "Coastal residential" },
  { slug: "khar-west-fluid-interiors", awardCategory: "Interior architecture" },
  { slug: "rajapalayam-farmhouse-generations", awardCategory: "Rural architecture" },
  { slug: "celebrity-homes-art-decisions", awardCategory: "Editorial spotlight" },
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
