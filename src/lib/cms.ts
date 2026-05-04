export type CmsCollection = "news_items" | "articles" | "products" | "events" | "top_100";

export type CmsEntry = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body?: string;
  image_url?: string;
  category?: string;
  published_at?: string;
  manufacturer?: string;
  company_about?: string;
  product_about?: string;
  cta_text?: string;
  cta_url?: string;
  pdf_url?: string;
  seo_title?: string;
  seo_description?: string;
  rank?: number;
};

const fallback: Record<CmsCollection, CmsEntry[]> = {
  news_items: [
    {
      id: "news-1",
      slug: "ai-concept-tools-enter-studios",
      title: "AI-Assisted Concept Tools Enter Architecture Studios in 2026 Workflow Shift",
      excerpt:
        "Architects are integrating AI concepting in early-stage ideation, reducing schematic iteration time and improving climate analysis outcomes.",
      category: "Architecture Technology",
      body:
        "Architecture practices across India, Singapore, and the UAE are testing AI-assisted concept workflows for massing options, daylight simulation, and circulation alternatives. Firms report faster iteration and improved early-stage communication with clients. Senior architects still lead design decisions, but automation now helps teams test more variants in less time. This shift is especially visible in hospitality and mixed-use design where feasibility and speed are critical.",
      seo_title:
        "AI in Architecture 2026: How Design Studios Use AI-Assisted Concept Tools",
      seo_description:
        "Discover how architecture studios are using AI-assisted concept tools in 2026 to speed up schematic design and climate-first decision making.",
      published_at: "2026-04-05T08:00:00.000Z",
    },
    {
      id: "news-2",
      slug: "climate-responsive-housing-standards-update",
      title: "Climate-Responsive Housing Standards Update Raises Passive Design Benchmark",
      excerpt:
        "New benchmark guidance encourages thermal comfort-first architecture with passive ventilation, shading logic, and low-embodied materials.",
      category: "Policy",
      body:
        "Design councils and urban development agencies are tightening climate-responsive design guidelines for new housing proposals. The latest recommendations prioritize passive cooling, orientation-sensitive envelopes, and local material systems. Developers are responding by commissioning more early-stage environmental simulations and engaging façade consultants at concept stage.",
      seo_title:
        "Climate-Responsive Housing: New Passive Design Standards for 2026",
      seo_description:
        "A breakdown of updated housing standards for climate-responsive architecture, passive cooling, and resilient envelope design.",
      published_at: "2026-04-04T09:00:00.000Z",
    },
    {
      id: "news-3",
      slug: "adaptive-reuse-capital-growth",
      title: "Adaptive Reuse Projects Attract New Capital as City-Center Land Tightens",
      excerpt:
        "Commercial and cultural reuse projects gain momentum as investors back lower-carbon renovation over ground-up construction.",
      category: "Urban Development",
      body:
        "Adaptive reuse has moved from niche to mainstream in several metropolitan markets. Investors cite reduced entitlement friction, lower demolition burden, and stronger storytelling value for mixed-use repositioning projects. Architects are now building reuse-specific teams that combine conservation strategy with high-performance systems retrofit.",
      seo_title: "Adaptive Reuse in 2026: Why Investors Back Renovation-Led Development",
      seo_description:
        "Learn why adaptive reuse architecture is attracting capital in 2026 and reshaping city-center development models.",
      published_at: "2026-04-03T10:00:00.000Z",
    },
  ],
  articles: [
    {
      id: "article-1",
      slug: "courtyard-typology-return",
      title: "Why courtyards are returning to premium homes",
      excerpt: "A climate and lifestyle analysis across tropical and semi-arid regions.",
      category: "Architecture",
      body:
        "Courtyard-centric planning has re-emerged as a high-performance strategy for contemporary homes in warm climates. Beyond aesthetics, courtyards enable stack ventilation, filtered daylight, and microclimate moderation. Designers are pairing this typology with hybrid materials and low-energy systems for resilient luxury.",
      seo_title: "Courtyard Homes in 2026: Passive Cooling, Privacy, and Contemporary Luxury",
      seo_description:
        "An in-depth article on why courtyard typologies are returning in premium residential architecture.",
    },
    {
      id: "article-2",
      slug: "stone-lime-modernity",
      title: "Stone, Lime, and Modernity: Material Intelligence in Regional Luxury Architecture",
      excerpt:
        "How regional masonry and lime systems are shaping a new vocabulary for durable, low-carbon premium projects.",
      category: "Materials",
      body:
        "Regional stone and lime have returned as preferred systems for architects designing climate-aware luxury environments. The shift is driven by thermal performance, craft continuity, and long-term maintenance value. New detailing methods allow these traditional materials to coexist with contemporary services and structure.",
      seo_title: "Regional Stone and Lime in Luxury Architecture: 2026 Material Guide",
      seo_description:
        "Explore how stone and lime are redefining modern, climate-aware architecture in premium projects.",
    },
  ],
  products: [
    {
      id: "product-1",
      slug: "regional-stone-series",
      title: "Regional Stone Series 2026",
      excerpt: "A curated material line optimized for contemporary luxury projects.",
      category: "Materials",
      manufacturer: "Lithic Works India",
      company_about:
        "Lithic Works develops high-performance natural stone systems for residential, hospitality, and public architecture.",
      product_about:
        "Regional Stone Series 2026 includes calibrated slabs and façade modules designed for thermal resilience and long service life.",
      cta_text: "Enquire with manufacturer",
      cta_url: "/api/project-enquiries",
      pdf_url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      seo_title: "Regional Stone Series 2026: Sustainable Premium Stone for Architecture",
      seo_description:
        "Product profile, manufacturer details, and downloadable PDF for Regional Stone Series 2026.",
    },
    {
      id: "product-2",
      slug: "aero-shade-facade-system",
      title: "AeroShade Adaptive Facade System",
      excerpt:
        "A parametric shading and ventilation facade system for mixed-use and institutional buildings.",
      category: "Facade Systems",
      manufacturer: "AeroBuild Envelope Labs",
      company_about:
        "AeroBuild specializes in high-performance envelope technologies focused on daylight and thermal control.",
      product_about:
        "AeroShade combines lightweight fins and operable modules to optimize glare, heat gain, and natural airflow.",
      cta_text: "Request technical consultation",
      cta_url: "/api/project-enquiries",
      pdf_url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      seo_title: "AeroShade Facade System: Adaptive Envelope for Thermal and Daylight Performance",
      seo_description:
        "Technical product overview for AeroShade adaptive facade system with manufacturer and PDF attachment.",
    },
    {
      id: "product-3",
      slug: "quietflow-mep-suite",
      title: "QuietFlow MEP Comfort Suite",
      excerpt:
        "Low-noise HVAC distribution package for premium homes, hotels, and boutique workplaces.",
      category: "MEP & HVAC",
      manufacturer: "QuietFlow Climate Engineering",
      company_about:
        "QuietFlow designs acoustic-first HVAC and ventilation products for high-comfort architectural environments.",
      product_about:
        "QuietFlow suite offers modular low-noise diffusers, insulated ducts, and smart balancing controls.",
      cta_text: "Schedule product demo",
      cta_url: "/api/project-enquiries",
      pdf_url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      seo_title: "QuietFlow MEP Suite: Low-Noise HVAC Solution for Premium Architecture",
      seo_description:
        "Discover QuietFlow MEP suite with manufacturer details, product benefits, and downloadable PDF.",
    },
  ],
  events: [
    {
      id: "event-1",
      slug: "india-design-forum-2026",
      title: "India Design Forum 2026",
      excerpt: "Annual forum on architecture, interiors, and urban futures.",
      category: "Conference",
      body:
        "India Design Forum 2026 brings architects, planners, and researchers together for sessions on adaptive urbanism, climate-resilient housing, and material innovation.",
      published_at: "2026-06-12T10:00:00.000Z",
    },
    {
      id: "event-2",
      slug: "coastal-resilience-summit-2026",
      title: "Coastal Resilience Summit 2026",
      excerpt:
        "A focused summit on flood-adaptive planning, resilient landscapes, and coastal infrastructure design.",
      category: "Summit",
      body:
        "Experts from architecture, hydrology, and policy will present integrated strategies for resilient coastal regions.",
      published_at: "2026-07-03T09:00:00.000Z",
    },
    {
      id: "event-3",
      slug: "student-futures-review-week",
      title: "Student Futures Review Week",
      excerpt:
        "A curated week of architecture school thesis previews and mentoring sessions with leading studios.",
      category: "Student Event",
      body:
        "Architecture students present graduation projects, experimental housing prototypes, and urban futures frameworks to a jury of practitioners.",
      published_at: "2026-08-20T09:00:00.000Z",
    },
  ],
  top_100: [
    {
      id: "top-1",
      slug: "top-100-2026",
      title: "Top 100 Roadmap 2026",
      excerpt:
        "A route-based annual ranking that maps 100 influential projects shaping architecture and design culture.",
      category: "Ranking",
      rank: 1,
    },
    {
      id: "top-2",
      slug: "top-100-climate-innovation-hub",
      title: "Climate Innovation Hub",
      excerpt:
        "A leading benchmark project for passive systems, public education, and low-carbon material strategy.",
      category: "Top 100",
      rank: 7,
    },
    {
      id: "top-3",
      slug: "top-100-courtyard-urban-lab",
      title: "Courtyard Urban Living Lab",
      excerpt:
        "A mixed-use typology study integrating social courtyards, walkability, and thermal comfort metrics.",
      category: "Top 100",
      rank: 18,
    },
    {
      id: "top-4",
      slug: "top-100-adaptive-reuse-campus",
      title: "Adaptive Reuse Civic Campus",
      excerpt:
        "A high-impact transformation of legacy structures into an active, climate-conscious civic district.",
      category: "Top 100",
      rank: 31,
    },
  ],
};

function directusBase() {
  return process.env.DIRECTUS_URL?.trim() ?? "";
}

function directusToken() {
  return process.env.DIRECTUS_PUBLIC_TOKEN?.trim() || process.env.DIRECTUS_STATIC_TOKEN?.trim() || "";
}

async function fetchDirectusCollection(collection: CmsCollection): Promise<CmsEntry[] | null> {
  const base = directusBase();
  if (!base) return null;
  const token = directusToken();

  const url = `${base}/items/${collection}?fields=id,slug,title,excerpt,body,image_url,category,published_at,manufacturer,company_about,product_about,cta_text,cta_url,pdf_url,seo_title,seo_description,rank&sort=-published_at&limit=100`;
  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    next: { revalidate: 60 },
  }).catch(() => null);
  if (!res?.ok) return null;
  const json = (await res.json().catch(() => null)) as { data?: Array<Record<string, unknown>> } | null;
  const rows = Array.isArray(json?.data) ? json.data : [];
  return rows.map((row) => ({
    id: String(row.id ?? crypto.randomUUID()),
    slug: String(row.slug ?? ""),
    title: String(row.title ?? "Untitled"),
    excerpt: String(row.excerpt ?? ""),
    body: row.body ? String(row.body) : undefined,
    image_url: row.image_url ? String(row.image_url) : undefined,
    category: row.category ? String(row.category) : undefined,
    published_at: row.published_at ? String(row.published_at) : undefined,
    manufacturer: row.manufacturer ? String(row.manufacturer) : undefined,
    company_about: row.company_about ? String(row.company_about) : undefined,
    product_about: row.product_about ? String(row.product_about) : undefined,
    cta_text: row.cta_text ? String(row.cta_text) : undefined,
    cta_url: row.cta_url ? String(row.cta_url) : undefined,
    pdf_url: row.pdf_url ? String(row.pdf_url) : undefined,
    seo_title: row.seo_title ? String(row.seo_title) : undefined,
    seo_description: row.seo_description ? String(row.seo_description) : undefined,
    rank: typeof row.rank === "number" ? row.rank : undefined,
  }));
}

export async function getCmsEntries(collection: CmsCollection): Promise<CmsEntry[]> {
  const live = await fetchDirectusCollection(collection);
  if (live && live.length > 0) return live;
  return fallback[collection];
}

export async function getCmsEntryBySlug(collection: CmsCollection, slug: string): Promise<CmsEntry | null> {
  const entries = await getCmsEntries(collection);
  return entries.find((e) => e.slug === slug) ?? null;
}
