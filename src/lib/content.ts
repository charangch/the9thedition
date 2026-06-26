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

/** Local Hollyhock architectural photography — see public/images/projects/ */
const P = (slug: string) => `/images/projects/${slug}/0.jpg`;

export const featuredStories: EditorialStory[] = [
  {
    title: "This climate-smart Hyderabad residence is designed to make air-conditioning optional",
    excerpt:
      "A layered envelope of shaded courts, thermal mass walls, and porous living spaces creates a naturally cooled home that stays elegant and efficient all year.",
    image: P("hyderabad-climate-smart-residence"),
    category: "Architecture & Design",
    location: "Hyderabad",
    byline: "By Editorial Desk",
  },
  {
    title: "Inside a courtyard home in Kochi rooted in craft, memory, and monsoon light",
    excerpt:
      "Brick jaalis, reclaimed timber, and handmade tiles frame a refined domestic language where vernacular intelligence meets contemporary detailing.",
    image: P("kochi-courtyard-craft-memory"),
    category: "Homes",
    location: "Kochi",
    byline: "By Rhea Menon",
  },
  {
    title: "A layered apartment balancing walnut, lime, and quiet light",
    excerpt:
      "Walnut joinery, chalk-lime walls, and soft layered lighting shape a metro apartment where texture and calm replace excess.",
    image: P("interiors-texture-light-silence"),
    category: "Interiors",
    byline: "By Naina Shah",
  },
  {
    title: "A 40,000-square-foot estate in Alibag unfolds around nine courtyards",
    excerpt:
      "This expansive residence uses a sequence of courts, stone passages, and landscaped voids to create rhythm, privacy, and dramatic procession.",
    image: P("alibag-nine-courtyards"),
    category: "Projects",
    location: "Alibag",
    byline: "By Studio Watch",
  },
  {
    title: "A luminous Kottayam home choreographs sun and shade with vernacular precision",
    excerpt:
      "Sloping roofs, deep overhangs, and breezy corridors draw from local wisdom while crafting a sharply contemporary silhouette.",
    image: P("kottayam-sun-shade-vernacular"),
    category: "Homes",
    location: "Kottayam",
    byline: "By AD Features",
  },
  {
    title: "This Bengaluru apartment channels a bold Mexican palette with sculpted brutalism",
    excerpt:
      "Terracotta, cobalt, and tactile plaster surfaces bring playfulness to a space where arches and heavy forms anchor the plan.",
    image: P("bengaluru-mexican-palette-brutalism"),
    category: "Interiors",
    location: "Bengaluru",
    byline: "By Home Edit",
  },
  {
    title: "Designer directory special: 14 studios reshaping hospitality interiors in India",
    excerpt:
      "A curated list of practices blending regional materiality, immersive lighting, and memorable spatial storytelling.",
    image: P("designer-directory-hospitality-interiors"),
    category: "Professionals",
    byline: "By Directory Team",
  },
];

export const leadStory: EditorialStory = {
  title: "Homes 2026: The new posh language of Indian residential design",
  excerpt:
    "From Thrissur and Alibag to Surat and Bengaluru, a fresh generation of homes is blending climate intelligence, handcrafted surfaces, and global sophistication with unmistakable local character.",
  image: P("hyderabad-climate-smart-residence"),
  category: "Cover Story",
  byline: "By the9thedition Editors",
};

export const secondaryLeadStories: EditorialStory[] = [
  {
    title: "Birdhouses of Kutch: how community towers became social architecture",
    excerpt: "An illustrated look at sculptural chabutras that bridge craft, ecology, and ritual life.",
    image: P("birdhouses-kutch-community-towers"),
    category: "Culture",
    byline: "By Special Report",
  },
  {
    title: "The rise of contemporary courtyards in tropical luxury homes",
    excerpt: "Why architects are re-centering plans around light wells, gardens, and thermal comfort.",
    image: P("courtyards-tropical-luxury-homes"),
    category: "Architecture",
    byline: "By Design Bureau",
  },
  {
    title: "Inside celebrity homes where art leads every design decision",
    excerpt: "A tour through private collections, statement walls, and emotionally curated interiors.",
    image: P("celebrity-homes-art-decisions"),
    category: "Celebrity",
    byline: "By Lifestyle Desk",
  },
];

export const projectSpotlights: EditorialStory[] = [
  {
    title: "A forest bungalow in Thrissur grows around a mango tree",
    excerpt: "A 6,250 sq ft house where nature, memory, and daily rituals shape planning decisions.",
    image: P("thrissur-forest-bungalow-mango"),
    category: "Projects",
    location: "Thrissur",
  },
  {
    title: "This Pawna weekend retreat pairs rustic stone with Texan warmth",
    excerpt: "A hilltop family home balancing chalet comfort and expansive valley views.",
    image: P("pawna-weekend-rustic-stone"),
    category: "Weekend Homes",
    location: "Pawna",
  },
  {
    title: "A Jaipur residence reinterprets haveli planning for modern life",
    excerpt: "Layered thresholds, screened galleries, and artisanal limewash create soft grandeur.",
    image: P("jaipur-haveli-modern-life"),
    category: "Architecture",
    location: "Jaipur",
  },
  {
    title: "In Khar West, fluid interiors make a compact footprint feel generous",
    excerpt: "Curved partitions and tonal surfaces soften edges in this elegant urban home.",
    image: P("khar-west-fluid-interiors"),
    category: "Interiors",
    location: "Mumbai",
  },
  {
    title: "A coastal Chennai villa uses deep verandahs to frame sea breezes",
    excerpt: "Passive cooling, polished stone, and shaded terraces build timeless tropical luxury.",
    image: P("chennai-coastal-villa-verandahs"),
    category: "Homes",
    location: "Chennai",
  },
  {
    title: "This Rajapalayam farmhouse celebrates three generations of making",
    excerpt: "A layered retreat where contemporary comfort sits gently inside agrarian memory.",
    image: P("rajapalayam-farmhouse-generations"),
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
    text: "Layered walnut and lime interiors in a calm metro apartment",
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
      image: P("temple-architecture-modern-gallery"),
      category: "Culture",
    },
    {
      title: "Portrait of an artist: inside creative studios shaping visual language",
      excerpt: "A closer look at workspaces where experimentation drives craft and identity.",
      image: P("portrait-artist-studios"),
      category: "Art",
    },
    {
      title: "Why biennale cities are becoming year-round design destinations",
      excerpt: "Local ecosystems of galleries, cafes, and ateliers now anchor cultural tourism.",
      image: P("biennale-cities-design-destinations"),
      category: "Travel & Culture",
    },
  ],
};
