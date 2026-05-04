export const navItems = [
  { href: "/", label: "Home" },
  { href: "/projects", label: "Projects" },
  { href: "/professionals", label: "Professionals" },
  { href: "/architecture-news", label: "News" },
  { href: "/articles", label: "Articles" },
  { href: "/archive", label: "Archive" },
  { href: "/awards", label: "Awards" },
  { href: "/submission-guidelines", label: "Submit" },
  { href: "/top-100", label: "Top 100" },
];

export const primaryNavItems = navItems.slice(0, 5);
export const overflowNavItems = navItems.slice(5);

export const projectCategories = [
  "Architecture & Design",
  "Decorating",
  "Lifestyle",
  "Celebrity",
  "Culture",
];

export type EditorialStory = {
  title: string;
  excerpt: string;
  image: string;
  category: string;
  location?: string;
  byline?: string;
};

export const featuredStories: EditorialStory[] = [
  {
    title: "This climate-smart Hyderabad residence is designed to make air-conditioning optional",
    excerpt:
      "A layered envelope of shaded courts, thermal mass walls, and porous living spaces creates a naturally cooled home that stays elegant and efficient all year.",
    image:
      "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?q=80&w=1600&auto=format&fit=crop",
    category: "Architecture & Design",
    location: "Hyderabad",
    byline: "By Editorial Desk",
  },
  {
    title: "Inside a courtyard home in Kochi rooted in craft, memory, and monsoon light",
    excerpt:
      "Brick jaalis, reclaimed timber, and handmade tiles frame a refined domestic language where vernacular intelligence meets contemporary detailing.",
    image:
      "https://images.unsplash.com/photo-1494526585095-c41746248156?q=80&w=1600&auto=format&fit=crop",
    category: "Homes",
    location: "Kochi",
    byline: "By Rhea Menon",
  },
  {
    title: "10 interiors balancing texture, light, and quiet luxury",
    excerpt:
      "From moody walnut libraries to chalk-lime kitchens, these rooms show how layered materials can feel indulgent yet calm.",
    image:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1600&auto=format&fit=crop",
    category: "Interiors",
    byline: "By Naina Shah",
  },
  {
    title: "A 40,000-square-foot estate in Alibag unfolds around nine courtyards",
    excerpt:
      "This expansive residence uses a sequence of courts, stone passages, and landscaped voids to create rhythm, privacy, and dramatic procession.",
    image:
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=1600&auto=format&fit=crop",
    category: "Projects",
    location: "Alibag",
    byline: "By Studio Watch",
  },
  {
    title: "A luminous Kottayam home choreographs sun and shade with vernacular precision",
    excerpt:
      "Sloping roofs, deep overhangs, and breezy corridors draw from local wisdom while crafting a sharply contemporary silhouette.",
    image:
      "https://images.unsplash.com/photo-1600607687644-c7171b42498f?q=80&w=1600&auto=format&fit=crop",
    category: "Homes",
    location: "Kottayam",
    byline: "By AD Features",
  },
  {
    title: "This Bengaluru apartment channels a bold Mexican palette with sculpted brutalism",
    excerpt:
      "Terracotta, cobalt, and tactile plaster surfaces bring playfulness to a space where arches and heavy forms anchor the plan.",
    image:
      "https://images.unsplash.com/photo-1616486029423-aaa4789e8c9a?q=80&w=1600&auto=format&fit=crop",
    category: "Interiors",
    location: "Bengaluru",
    byline: "By Home Edit",
  },
  {
    title: "Designer directory special: 14 studios reshaping hospitality interiors in India",
    excerpt:
      "A curated list of practices blending regional materiality, immersive lighting, and memorable spatial storytelling.",
    image:
      "https://images.unsplash.com/photo-1554995207-c18c203602cb?q=80&w=1600&auto=format&fit=crop",
    category: "Professionals",
    byline: "By Directory Team",
  },
];

export const leadStory: EditorialStory = {
  title: "AD Homes 2026: The new posh language of Indian residential design",
  excerpt:
    "From Thrissur and Alibag to Surat and Bengaluru, a fresh generation of homes is blending climate intelligence, handcrafted surfaces, and global sophistication with unmistakable local character.",
  image:
    "https://images.unsplash.com/photo-1464146072230-91cabc968266?q=80&w=2000&auto=format&fit=crop",
  category: "Cover Story",
  byline: "By the9thedition Editors",
};

export const secondaryLeadStories: EditorialStory[] = [
  {
    title: "Birdhouses of Kutch: how community towers became social architecture",
    excerpt: "An illustrated look at sculptural chabutras that bridge craft, ecology, and ritual life.",
    image:
      "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?q=80&w=1200&auto=format&fit=crop",
    category: "Culture",
    byline: "By Special Report",
  },
  {
    title: "The rise of contemporary courtyards in tropical luxury homes",
    excerpt: "Why architects are re-centering plans around light wells, gardens, and thermal comfort.",
    image:
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=1200&auto=format&fit=crop",
    category: "Architecture",
    byline: "By Design Bureau",
  },
  {
    title: "Inside celebrity homes where art leads every design decision",
    excerpt: "A tour through private collections, statement walls, and emotionally curated interiors.",
    image:
      "https://images.unsplash.com/photo-1616593969747-4797dc75033e?q=80&w=1200&auto=format&fit=crop",
    category: "Celebrity",
    byline: "By Lifestyle Desk",
  },
];

export const projectSpotlights: EditorialStory[] = [
  {
    title: "A forest bungalow in Thrissur grows around a mango tree",
    excerpt: "A 6,250 sq ft house where nature, memory, and daily rituals shape planning decisions.",
    image:
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?q=80&w=1400&auto=format&fit=crop",
    category: "Projects",
    location: "Thrissur",
  },
  {
    title: "This Pawna weekend retreat pairs rustic stone with Texan warmth",
    excerpt: "A hilltop family home balancing chalet comfort and expansive valley views.",
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1400&auto=format&fit=crop",
    category: "Weekend Homes",
    location: "Pawna",
  },
  {
    title: "A Jaipur residence reinterprets haveli planning for modern life",
    excerpt: "Layered thresholds, screened galleries, and artisanal limewash create soft grandeur.",
    image:
      "https://images.unsplash.com/photo-1600566752355-35792bedcfea?q=80&w=1400&auto=format&fit=crop",
    category: "Architecture",
    location: "Jaipur",
  },
  {
    title: "In Khar West, fluid interiors make a compact footprint feel generous",
    excerpt: "Curved partitions and tonal surfaces soften edges in this elegant urban home.",
    image:
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=1400&auto=format&fit=crop",
    category: "Interiors",
    location: "Mumbai",
  },
  {
    title: "A coastal Chennai villa uses deep verandahs to frame sea breezes",
    excerpt: "Passive cooling, polished stone, and shaded terraces build timeless tropical luxury.",
    image:
      "https://images.unsplash.com/photo-1600047509782-20d39509f26d?q=80&w=1400&auto=format&fit=crop",
    category: "Homes",
    location: "Chennai",
  },
  {
    title: "This Rajapalayam farmhouse celebrates three generations of making",
    excerpt: "A layered retreat where contemporary comfort sits gently inside agrarian memory.",
    image:
      "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?q=80&w=1400&auto=format&fit=crop",
    category: "Rural Living",
    location: "Rajapalayam",
  },
];

export const marketAndNews = [
  "AI-assisted housing concept tools are entering early-stage design studios",
  "Regional stone and lime plaster suppliers report strongest demand in five years",
  "Luxury kitchen brands are launching India-specific modular collections",
  "Boutique hospitality projects now prefer smaller specialist interior teams",
  "Sustainable material libraries are becoming default in premium architecture offices",
  "Collectors are commissioning site-specific art for private residences",
];

export const directoryPicks = [
  "AD Pro Directory: architecture firms with standout climate-responsive work",
  "Interior design studios known for handcrafted material palettes",
  "Lighting consultants shaping mood-led residential narratives",
  "Landscape practices specializing in courtyard ecosystems",
];

export const newsletterHighlights = [
  "The 9 homes everyone in design circles is sharing this week",
  "Material intelligence: lime, laterite, and timber in modern projects",
  "Top 100 watchlist: practices redefining Indian luxury architecture",
];

/** Homepage “Editor’s radar” strip — each line links somewhere real (projects, sections, or lists). */
export type EditorsRadarItem = { text: string; href: string };

export const editorsRadar: EditorsRadarItem[] = [
  {
    text: "Climate-responsive homes that make air-conditioning optional",
    href: "/projects/hyderabad-climate-smart-residence",
  },
  {
    text: "Regional materials shaping a new Indian luxury language",
    href: "/projects/kochi-courtyard-craft-memory",
  },
  {
    text: "How adaptive reuse is redefining city-center culture districts",
    href: "/projects/jaipur-haveli-modern-life",
  },
  {
    text: "Designer directories now influence project decisions more than ads",
    href: "/professionals",
  },
  {
    text: "Why courtyard typologies are returning in contemporary residences",
    href: "/projects/alibag-nine-courtyards",
  },
  {
    text: "Inside celebrity homes where art curation leads spatial planning",
    href: "/projects/celebrity-homes-art-decisions",
  },
  {
    text: "Emerging hospitality projects are prioritizing mood-first interior storytelling",
    href: "/projects/designer-directory-hospitality-interiors",
  },
  {
    text: "AI-assisted concepting enters early architecture ideation workflows",
    href: "/architecture-news",
  },
  {
    text: "Courtyard-centric plans dominate premium villa commissions this season",
    href: "/projects/courtyards-tropical-luxury-homes",
  },
  {
    text: "Sculptural staircases are becoming focal pieces in compact urban homes",
    href: "/projects/interiors-texture-light-silence",
  },
];

export const sectionStories = {
  homes: featuredStories.slice(0, 4),
  projects: projectSpotlights.slice(0, 4),
  culture: [
    {
      title: "Temple architecture and the modern gallery: a cross-cultural conversation",
      excerpt: "How sacred proportions and contemporary curatorial spaces intersect today.",
      image:
        "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?q=80&w=1400&auto=format&fit=crop",
      category: "Culture",
    },
    {
      title: "Portrait of an artist: inside creative studios shaping visual language",
      excerpt: "A closer look at workspaces where experimentation drives craft and identity.",
      image:
        "https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=1400&auto=format&fit=crop",
      category: "Art",
    },
    {
      title: "Why biennale cities are becoming year-round design destinations",
      excerpt: "Local ecosystems of galleries, cafes, and ateliers now anchor cultural tourism.",
      image:
        "https://images.unsplash.com/photo-1518998053901-5348d3961a04?q=80&w=1400&auto=format&fit=crop",
      category: "Travel & Culture",
    },
  ],
};
