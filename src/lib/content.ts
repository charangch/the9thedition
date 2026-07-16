export const navItems = [
  { href: "/", label: "Home" },
  { href: "/projects", label: "Projects" },
  { href: "/professionals", label: "Professionals" },
  { href: "/architecture-news", label: "News" },
  { href: "/articles", label: "Articles" },
  { href: "/archive", label: "Archive" },
  { href: "/awards", label: "Awards" },
  { href: "/submission-guidelines", label: "Submit" },
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

/** Local catalog photography — see public/images/projects/ */
const P = (slug: string) => `/images/projects/${slug}/0.jpg`;

export const featuredStories: EditorialStory[] = [
  {
    title: "A Menorcan Residence Where Architecture Negotiates with the Wind",
    excerpt: "A Menorcan Residence Where Architecture Negotiates with the Wind",
    image: P("vela-house"),
    category: "Architecture & Design",
    location: "Menorca",
    byline: "By Estudi Norda",
  },
  {
    title: "A Kanazawa Residence Shaped by Rain, Shadow and Three Gardens",
    excerpt: "A Kanazawa Residence Shaped by Rain, Shadow and Three Gardens",
    image: P("kurokawa-courtyard-house"),
    category: "Architecture & Design",
    location: "Kanazawa",
    byline: "By Mizuha Atelier",
  },
  {
    title: "A Copenhagen Warehouse Reimagined as a Sequence of Rooms Within a Room",
    excerpt: "A Copenhagen Warehouse Reimagined as a Sequence of Rooms Within a Room",
    image: P("the-copper-passage"),
    category: "Architecture & Design",
    location: "Copenhagen",
    byline: "By Feld & Havn Studio",
  },
  {
    title: "A Forest Residence in Mexico Designed Around the Changing Night Sky",
    excerpt: "A Forest Residence in Mexico Designed Around the Changing Night Sky",
    image: P("sierra-observatory-house"),
    category: "Architecture & Design",
    location: "Valle de Bravo",
    byline: "By Taller Umbral",
  },
  {
    title: "A Geothermal Retreat in Iceland Shaped by Darkness, Steam and the Northern Sky",
    excerpt: "A Geothermal Retreat in Iceland Shaped by Darkness, Steam and the Northern Sky",
    image: P("hotel-nott"),
    category: "Architecture & Design",
    location: "Hella",
    byline: "By Norður Atelier",
  },
  {
    title: "A Historic Porto Townhouse Reimagined Through a Vertical Sequence of Light",
    excerpt: "A Historic Porto Townhouse Reimagined Through a Vertical Sequence of Light",
    image: P("rua-das-janelas"),
    category: "Architecture & Design",
    location: "Porto",
    byline: "By Atelier Linha Norte",
  },
  {
    title: "A Desert Residence in Central Australia Built Around Shade, Distance and the Horizon",
    excerpt: "A Desert Residence in Central Australia Built Around Shade, Distance and the Horizon",
    image: P("red-earth-house"),
    category: "Architecture & Design",
    location: "Alice Springs",
    byline: "By Morrow Field Studio",
  },
];

export const leadStory: EditorialStory = {
  title: "The Ninth Edition: Twenty residences shaped by climate, craft, and place",
  excerpt:
    "From Menorca and Kanazawa to Iceland and the Namib, a new global project library documents how contemporary architecture negotiates wind, water, stone, and light.",
  image: P("vela-house"),
  category: "Cover Story",
  byline: "By the9thedition Editors",
};

export const secondaryLeadStories: EditorialStory[] = [
  {
    title: "A Coastal Residence in Iceland Shaped by Basalt, Ocean Winds and the Northern Horizon",
    excerpt: "A Coastal Residence in Iceland Shaped by Basalt, Ocean Winds and the Northern Horizon",
    image: P("edge-of-the-north"),
    category: "Architecture & Design",
    location: "Snæfellsnes Peninsula",
    byline: "By Norður Atelier",
  },
  {
    title: "A Contemporary Kyoto Residence Shaped by Timber, Courtyards and the Passage of Light",
    excerpt: "A Contemporary Kyoto Residence Shaped by Timber, Courtyards and the Passage of Light",
    image: P("house-between-gardens"),
    category: "Architecture & Design",
    location: "Kyoto",
    byline: "By Atelier Kinu",
  },
  {
    title: "A Sculptural Coastal Residence in Western Australia Carved Between Limestone, Light and the Indian Ocean",
    excerpt:
      "A Sculptural Coastal Residence in Western Australia Carved Between Limestone, Light and the Indian Ocean",
    image: P("the-hollow-coast"),
    category: "Architecture & Design",
    location: "Margaret River",
    byline: "By Studio Pale Ground",
  },
];

export const projectSpotlights: EditorialStory[] = [
  {
    title: "A Cliffside Wellness Retreat in Milos Carved Between Stone and the Aegean Sea",
    excerpt: "A Cliffside Wellness Retreat in Milos Carved Between Stone and the Aegean Sea",
    image: P("the-white-descent"),
    category: "Architecture & Design",
    location: "Milos",
  },
  {
    title: "A Mountain Residence in Hokkaido Designed Around Silence, Warmth and the Winter Landscape",
    excerpt: "A Mountain Residence in Hokkaido Designed Around Silence, Warmth and the Winter Landscape",
    image: P("house-of-falling-snow"),
    category: "Architecture & Design",
    location: "Niseko",
  },
  {
    title: "A Tropical Residence in Costa Rica Built Around Rain, Concrete and the Forest Canopy",
    excerpt: "A Tropical Residence in Costa Rica Built Around Rain, Concrete and the Forest Canopy",
    image: P("canopy-void-house"),
    category: "Architecture & Design",
    location: "Uvita",
  },
  {
    title: "A Parisian Residence Reimagined Through Stone, Shadow and Contemporary Craft",
    excerpt: "A Parisian Residence Reimagined Through Stone, Shadow and Contemporary Craft",
    image: P("maison-de-l-ombre"),
    category: "Interior Design & Architecture",
    location: "Paris",
  },
  {
    title: "A Desert Residence in Namibia Framing the Silence and Scale of the Namib Landscape",
    excerpt: "A Desert Residence in Namibia Framing the Silence and Scale of the Namib Landscape",
    image: P("house-of-distant-dunes"),
    category: "Architecture & Design",
    location: "Sossusvlei",
  },
  {
    title: "A Vineyard Residence in Chile Shaped by Stone, Copper and Views Towards the Andes",
    excerpt: "A Vineyard Residence in Chile Shaped by Stone, Copper and Views Towards the Andes",
    image: P("valle-de-cobre"),
    category: "Architecture & Design",
    location: "Colchagua Valley",
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
  "Directory watchlist: practices redefining Indian luxury architecture",
];

/** Homepage “Editor’s radar” strip — each line links somewhere real (projects, sections, or lists). */
export type EditorsRadarItem = { text: string; href: string };

export const editorsRadar: EditorsRadarItem[] = [
  {
    text: "A Menorcan residence where architecture negotiates with the wind",
    href: "/projects/vela-house",
  },
  {
    text: "Kanazawa courtyards shaped by rain, shadow, and three gardens",
    href: "/projects/kurokawa-courtyard-house",
  },
  {
    text: "A Copenhagen warehouse reimagined as rooms within a room",
    href: "/projects/the-copper-passage",
  },
  {
    text: "Designer directories now influence project decisions more than ads",
    href: "/professionals",
  },
  {
    text: "A geothermal retreat in Iceland shaped by darkness and steam",
    href: "/projects/hotel-nott",
  },
  {
    text: "A Parisian residence of stone, shadow, and contemporary craft",
    href: "/projects/maison-de-l-ombre",
  },
  {
    text: "A desert residence in Namibia framing the scale of the Namib",
    href: "/projects/house-of-distant-dunes",
  },
  {
    text: "AI-assisted concepting enters early architecture ideation workflows",
    href: "/architecture-news",
  },
  {
    text: "A Kyoto residence shaped by timber, courtyards, and light",
    href: "/projects/house-between-gardens",
  },
  {
    text: "A Brazilian house suspended above the Atlantic canopy",
    href: "/projects/house-above-the-canopy",
  },
];

export const sectionStories = {
  homes: featuredStories.slice(0, 4),
  projects: projectSpotlights.slice(0, 4),
  culture: [
    {
      title: "A Tropical Residence in Mexico Shaped by Volcanic Stone, Water and Filtered Jungle Light",
      excerpt: "A Tropical Residence in Mexico Shaped by Volcanic Stone, Water and Filtered Jungle Light",
      image: P("casa-sombra"),
      category: "Architecture & Design",
    },
    {
      title: "A Remote Norwegian Residence Suspended Between Mountain, Water and Sky",
      excerpt: "A Remote Norwegian Residence Suspended Between Mountain, Water and Sky",
      image: P("above-the-silent-fjord"),
      category: "Architecture & Design",
    },
    {
      title: "A Desert Residence Outside Marrakech Shaped by Rammed Earth, Water and the Atlas Horizon",
      excerpt: "A Desert Residence Outside Marrakech Shaped by Rammed Earth, Water and the Atlas Horizon",
      image: P("house-of-red-earth"),
      category: "Architecture & Design",
    },
  ],
};
