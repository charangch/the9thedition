/** Primary site sections — used in footer, homepage discovery, and JSON-LD for search sitelinks. */
export type SiteSection = {
  href: string;
  title: string;
  description: string;
};

export const SITE_SECTIONS: SiteSection[] = [
  {
    href: "/projects",
    title: "Projects",
    description:
      "Featured architecture and interior design projects — residential, cultural, hospitality, and landscape works with photography and credits.",
  },
  {
    href: "/articles",
    title: "Articles",
    description:
      "Long-form editorial on architects, houses, building products, and design culture from The 9th Edition.",
  },
  {
    href: "/archive",
    title: "Archive",
    description:
      "Project archive of cultural, civic, educational, and residential architecture with editorial notes and precedent studies.",
  },
  {
    href: "/architecture-news",
    title: "Architecture News",
    description:
      "Industry news on construction, building technology, materials, urban development, and design policy.",
  },
  {
    href: "/professionals",
    title: "Professionals",
    description:
      "Directory of architecture studios and design professionals — profiles, regions, and practice focus.",
  },
  {
    href: "/newsletter",
    title: "Newsletter",
    description:
      "Subscribe for curated briefings on projects, products, and editorial intelligence from The 9th Edition.",
  },
  {
    href: "/awards",
    title: "Awards",
    description:
      "Design awards, competition round-ups, and recognition across architecture and interiors.",
  },
  {
    href: "/submission-guidelines",
    title: "Submit Work",
    description:
      "How architects and designers submit projects for editorial consideration at The 9th Edition.",
  },
];
