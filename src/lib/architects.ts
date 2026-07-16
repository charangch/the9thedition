import { catalogProjectHeroPath } from "@/lib/catalog-project-images";

export type ArchitectProfile = {
  slug: string;
  name: string;
  firm: string;
  bio: string;
  /** Optional portrait for directory cards */
  image?: string;
};

function slugifyFirm(firm: string): string {
  return firm
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Ninth Edition studios from TheNinthEdition folders 1–20 (unique ARCHITECTS values). */
export const architects: ArchitectProfile[] = [
  {
    slug: "estudi-norda",
    name: "Marta Alenyà",
    firm: "Estudi Norda",
    bio: "Menorca-based practice shaping coastal residences that negotiate wind, limestone, and Mediterranean light.",
    image: catalogProjectHeroPath("vela-house"),
  },
  {
    slug: "mizuha-atelier",
    name: "Ren Takamori",
    firm: "Mizuha Atelier",
    bio: "Kanazawa studio designing courtyard homes organised around rain, shadow, and garden sequences.",
    image: catalogProjectHeroPath("kurokawa-courtyard-house"),
  },
  {
    slug: "feld-havn-studio",
    name: "Søren Vestergaard",
    firm: "Feld & Havn Studio",
    bio: "Copenhagen practice known for adaptive reuse — warehouses reimagined as rooms within rooms.",
    image: catalogProjectHeroPath("the-copper-passage"),
  },
  {
    slug: "taller-umbral",
    name: "Taller Umbral",
    firm: "Taller Umbral",
    bio: "Mexican atelier designing forest and tropical residences around night sky, stone, water, and filtered light.",
    image: catalogProjectHeroPath("sierra-observatory-house"),
  },
  {
    slug: "nordur-atelier",
    name: "Norður Atelier",
    firm: "Norður Atelier",
    bio: "Icelandic studio shaping geothermal retreats and coastal houses for darkness, steam, and northern horizons.",
    image: catalogProjectHeroPath("hotel-nott"),
  },
  {
    slug: "atelier-linha-norte",
    name: "Inês Carvalho",
    firm: "Atelier Linha Norte",
    bio: "Porto practice reimagining historic townhouses through vertical sequences of light.",
    image: catalogProjectHeroPath("rua-das-janelas"),
  },
  {
    slug: "morrow-field-studio",
    name: "Clara Winton",
    firm: "Morrow Field Studio",
    bio: "Australian desert practice building residences around shade, distance, and horizon.",
    image: catalogProjectHeroPath("red-earth-house"),
  },
  {
    slug: "studio-thalassa",
    name: "Eleni Markou",
    firm: "Studio Thalassa",
    bio: "Cycladic studio carving cliffside wellness retreats between stone and the Aegean Sea.",
    image: catalogProjectHeroPath("the-white-descent"),
  },
  {
    slug: "kuro-mori-atelier",
    name: "Ren Takahashi",
    firm: "Kuro Mori Atelier",
    bio: "Hokkaido atelier designing mountain residences for silence, warmth, and winter landscape.",
    image: catalogProjectHeroPath("house-of-falling-snow"),
  },
  {
    slug: "estudio-umbral-verde",
    name: "Mateo Álvarez",
    firm: "Estudio Umbral Verde",
    bio: "Costa Rican studio building tropical houses around rain, concrete, and forest canopy.",
    image: catalogProjectHeroPath("canopy-void-house"),
  },
  {
    slug: "atelier-varenne",
    name: "Camille Moreau",
    firm: "Atelier Varenne",
    bio: "Parisian practice reimagining residences through stone, shadow, and contemporary craft.",
    image: catalogProjectHeroPath("maison-de-l-ombre"),
  },
  {
    slug: "terra-forma-collective",
    name: "Amara Venter",
    firm: "Terra Forma Collective",
    bio: "Namibian collective framing desert residences against the silence and scale of the Namib.",
    image: catalogProjectHeroPath("house-of-distant-dunes"),
  },
  {
    slug: "estudio-tierra-sur",
    name: "Sofía Valdés",
    firm: "Estudio Tierra Sur",
    bio: "Chilean vineyard architecture shaped by stone, copper, and views toward the Andes.",
    image: catalogProjectHeroPath("valle-de-cobre"),
  },
  {
    slug: "atelier-kinu",
    name: "Aiko Nakamura",
    firm: "Atelier Kinu",
    bio: "Kyoto atelier shaping contemporary residences through timber, courtyards, and the passage of light.",
    image: catalogProjectHeroPath("house-between-gardens"),
  },
  {
    slug: "studio-pale-ground",
    name: "Isla Bennett",
    firm: "Studio Pale Ground",
    bio: "Western Australian practice carving coastal residences between limestone, light, and the Indian Ocean.",
    image: catalogProjectHeroPath("the-hollow-coast"),
  },
  {
    slug: "nordhavn-studio",
    name: "Ingrid Solberg",
    firm: "Nordhavn Studio",
    bio: "Norwegian studio designing remote residences suspended between mountain, water, and sky.",
    image: catalogProjectHeroPath("above-the-silent-fjord"),
  },
  {
    slug: "atelier-tazrout",
    name: "Amira El Mansouri",
    firm: "Atelier Tazrout",
    bio: "Marrakech practice shaping desert residences in rammed earth, water, and Atlas horizons.",
    image: catalogProjectHeroPath("house-of-red-earth"),
  },
  {
    slug: "estudio-linha-tropical",
    name: "Marina Vasconcelos",
    firm: "Estúdio Linha Tropical",
    bio: "Brazilian studio designing houses suspended above the Atlantic canopy.",
    image: catalogProjectHeroPath("house-above-the-canopy"),
  },
];

const bySlug = new Map(architects.map((a) => [a.slug, a]));
const byFirm = new Map(architects.map((a) => [a.firm.trim().toLowerCase(), a.slug]));

export function getArchitectBySlug(slug: string): ArchitectProfile | undefined {
  return bySlug.get(slug);
}

export function getAllArchitectSlugs(): string[] {
  return architects.map((a) => a.slug);
}

export function getArchitectSlugByFirmName(firmName: string): string | null {
  const normalized = firmName.trim().toLowerCase();
  if (!normalized) return null;
  return byFirm.get(normalized) ?? null;
}

/** Resolve catalog architect slug from a DOCX ARCHITECTS / firm string. */
export function resolveArchitectSlugFromFirm(firmName: string): string {
  const fromMap = getArchitectSlugByFirmName(firmName);
  if (fromMap) return fromMap;
  const slug = slugifyFirm(firmName);
  return slug || "estudi-norda";
}
