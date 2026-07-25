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
    excerpt:
      "Limestone walls and sheltered courtyards shape a coastal house built for Menorca’s persistent winds.",
    image: P("vela-house"),
    category: "Architecture & Design",
    location: "Menorca",
    byline: "By Estudi Norda",
  },
  {
    title: "A Kanazawa Residence Shaped by Rain, Shadow and Three Gardens",
    excerpt:
      "A quiet domestic landscape organised around gardens, shadow, and Kanazawa’s rain-heavy climate.",
    image: P("kurokawa-courtyard-house"),
    category: "Architecture & Design",
    location: "Kanazawa",
    byline: "By Mizuha Atelier",
  },
  {
    title: "A Copenhagen Warehouse Reimagined as a Sequence of Rooms Within a Room",
    excerpt:
      "Freestanding copper volumes create a new architectural landscape inside a former warehouse.",
    image: P("the-copper-passage"),
    category: "Architecture & Design",
    location: "Copenhagen",
    byline: "By Feld & Havn Studio",
  },
  {
    title: "A Forest Residence in Mexico Designed Around the Changing Night Sky",
    excerpt:
      "Hidden in Valle de Bravo, the house frames the forest below while turning toward the night sky.",
    image: P("sierra-observatory-house"),
    category: "Architecture & Design",
    location: "Valle de Bravo",
    byline: "By Taller Umbral",
  },
  {
    title: "A Geothermal Retreat in Iceland Shaped by Darkness, Steam and the Northern Sky",
    excerpt:
      "An intimate retreat embedded in volcanic terrain, shaped by geothermal warmth and darkness.",
    image: P("hotel-nott"),
    category: "Architecture & Design",
    location: "Hella",
    byline: "By Norður Atelier",
  },
  {
    title: "A Historic Porto Townhouse Reimagined Through a Vertical Sequence of Light",
    excerpt:
      "Behind a restored façade, a narrow townhouse becomes a vertical journey of changing daylight.",
    image: P("rua-das-janelas"),
    category: "Architecture & Design",
    location: "Porto",
    byline: "By Atelier Linha Norte",
  },
  {
    title: "A Desert Residence in Central Australia Built Around Shade, Distance and the Horizon",
    excerpt:
      "Massive walls and deep shade create a refuge from extreme heat across the desert horizon.",
    image: P("red-earth-house"),
    category: "Architecture & Design",
    location: "Alice Springs",
    byline: "By Morrow Field Studio",
  },
];

export const leadStory: EditorialStory = {
  title: "The Ninth Edition: Twenty residences shaped by climate, craft, and place",
  excerpt:
    "Our first global project library gathers houses and retreats from Menorca to Marrakech — each documented with photography, build details, and the studios behind them.",
  image: P("vela-house"),
  category: "Cover Story",
  byline: "By the9thedition Editors",
};

export const secondaryLeadStories: EditorialStory[] = [
  {
    title: "Edge of the North",
    excerpt: "Basalt, ocean winds, and the northern horizon on Iceland’s Snæfellsnes Peninsula.",
    image: P("edge-of-the-north"),
    category: "Architecture & Design",
    location: "Snæfellsnes",
    byline: "By Norður Atelier",
  },
  {
    title: "House Between Gardens",
    excerpt: "Timber, courtyards, and the passage of light in a contemporary Kyoto residence.",
    image: P("house-between-gardens"),
    category: "Architecture & Design",
    location: "Kyoto",
    byline: "By Atelier Kinu",
  },
  {
    title: "The Hollow Coast",
    excerpt: "Limestone and light carved into a sculptural residence on Western Australia’s coast.",
    image: P("the-hollow-coast"),
    category: "Architecture & Design",
    location: "Margaret River",
    byline: "By Studio Pale Ground",
  },
];

export const projectSpotlights: EditorialStory[] = [
  {
    title: "The White Descent",
    excerpt: "A cliffside wellness retreat carved between stone and the Aegean Sea.",
    image: P("the-white-descent"),
    category: "Architecture & Design",
    location: "Milos",
  },
  {
    title: "House of Falling Snow",
    excerpt: "A Hokkaido mountain house designed for silence, warmth, and winter.",
    image: P("house-of-falling-snow"),
    category: "Architecture & Design",
    location: "Niseko",
  },
  {
    title: "Canopy Void House",
    excerpt: "Rain, concrete, and forest canopy shape this tropical Costa Rican residence.",
    image: P("canopy-void-house"),
    category: "Architecture & Design",
    location: "Uvita",
  },
  {
    title: "Maison de l’Ombre",
    excerpt: "A Parisian residence reimagined through stone, shadow, and contemporary craft.",
    image: P("maison-de-l-ombre"),
    category: "Interior Design & Architecture",
    location: "Paris",
  },
  {
    title: "House of Distant Dunes",
    excerpt: "A Namibian desert residence framing silence and the scale of the dunes.",
    image: P("house-of-distant-dunes"),
    category: "Architecture & Design",
    location: "Sossusvlei",
  },
  {
    title: "Valle de Cobre",
    excerpt: "Stone, copper, and Andean views organise this Chilean vineyard estate.",
    image: P("valle-de-cobre"),
    category: "Architecture & Design",
    location: "Colchagua Valley",
  },
];

export const marketAndNews = [
  "Limestone and rammed-earth detailing lead new residential commissions across the Mediterranean",
  "Geothermal hospitality projects in Iceland set a higher bar for climate-led guest experiences",
  "Adaptive reuse of warehouses continues to define northern European city living",
  "Courtyard plans return as the default for privacy and passive cooling in warm climates",
  "Material libraries now prioritise repairable stone, timber, and lime over trend finishes",
  "Private clients commission site-specific art as part of the architectural brief",
];

export const directoryPicks = [
  "Studios with standout climate-responsive residential work",
  "Interior practices known for stone, timber, and handcrafted joinery",
  "Lighting consultants shaping mood-led residential narratives",
  "Landscape practices specializing in courtyard and coastal ecosystems",
];

export const newsletterHighlights = [
  "The residences everyone in design circles is sharing this week",
  "Material intelligence: limestone, copper, and timber in new projects",
  "Directory watchlist: practices defining contemporary luxury architecture",
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
    text: "Architecture news: materials, climate, and studio practice",
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
