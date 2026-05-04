export type ArchitectProfile = {
  slug: string;
  name: string;
  firm: string;
  bio: string;
  /** Optional portrait for directory cards */
  image?: string;
};

/** Curated architect / studio profiles (linked from projects). */
export const architects: ArchitectProfile[] = [
  {
    slug: "iki-builds",
    name: "Iki Builds",
    firm: "Iki Builds",
    bio: "Hyderabad-based practice focused on climate-responsive residential architecture and net-zero experimentation.",
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop",
  },
  {
    slug: "temple-town",
    name: "Temple Town",
    firm: "Temple Town",
    bio: "Kerala studio weaving antiques, courtyards, and craft-led interiors into contemporary homes.",
    image:
      "https://images.unsplash.com/photo-1600566752355-35792bedcfea?q=80&w=800&auto=format&fit=crop",
  },
  {
    slug: "studio-momo",
    name: "Studio MoMo",
    firm: "Studio MoMo",
    bio: "Large-format residential and hospitality work with a signature language of courts, stone, and procession.",
    image:
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=800&auto=format&fit=crop",
  },
  {
    slug: "naked-volume",
    name: "Naked Volume",
    firm: "Naked Volume",
    bio: "Thrissur-based team known for homes that grow around landscape and memory.",
    image:
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?q=80&w=800&auto=format&fit=crop",
  },
  {
    slug: "nacl-studio",
    name: "NACL Studio",
    firm: "NACL Studio",
    bio: "Weekend and hillside retreats balancing rustic materiality with refined comfort.",
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=800&auto=format&fit=crop",
  },
  {
    slug: "the-last-goldfish",
    name: "The Last Goldfish",
    firm: "The Last Goldfish",
    bio: "Mumbai interiors studio shaping fluid, compact urban homes with sculptural surfaces.",
    image:
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=800&auto=format&fit=crop",
  },
  {
    slug: "lyth-design",
    name: "Lyth Design",
    firm: "Lyth Design",
    bio: "Pan-India interiors practice recognised for tonal palettes and bespoke joinery.",
    image:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=800&auto=format&fit=crop",
  },
  {
    slug: "soul-space",
    name: "Soul Space Design Studio",
    firm: "Soul Space Design Studio",
    bio: "Bengaluru studio exploring bold colour, brutalist massing, and playful residential narratives.",
    image:
      "https://images.unsplash.com/photo-1616486029423-aaa4789e8c9a?q=80&w=800&auto=format&fit=crop",
  },
  {
    slug: "the9thedition-editorial",
    name: "the9thedition Editorial",
    firm: "the9thedition",
    bio: "In-house curatorial and special projects desk for culture, travel, and directory features.",
    image:
      "https://images.unsplash.com/photo-1464146072230-91cabc968266?q=80&w=800&auto=format&fit=crop",
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
