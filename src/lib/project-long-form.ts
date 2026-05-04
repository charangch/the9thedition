export type ProjectSpecLine = { label: string; value: string };

export type ProjectLongForm = {
  dek: string;
  paragraphs: string[];
  extraSpecs?: ProjectSpecLine[];
  seo: {
    title: string;
    description: string;
    keywords: string[];
    geo_region: string;
  };
  faq: { question: string; answer: string }[];
  /** Full YouTube watch URL (embedded on the project page). */
  youtubeUrl: string;
  /** Alt text for each procedural gallery frame (20), aligned with generated-image indices 0–19. */
  imageAlts: string[];
};

/**
 * Per-slug editorial dossiers: SEO, GEO, AEO (FAQ), unique copy, one YouTube film each.
 * Gallery frames use on-site `/api/generated-image?c=projects&k=<slug>&i=0..19` (no stock URLs).
 */
export const PROJECT_LONG_FORM_BY_SLUG: Record<string, ProjectLongForm> = {
  "hyderabad-climate-smart-residence": {
    dek: "A net-zero minded residence in Kadthal pairs handcrafted earth construction with climate-responsive planning.",
    paragraphs: [
      "_Text description provided by the architects._ The brief asked for a home that could remain comfortable through Hyderabad’s hottest months without defaulting to mechanical cooling as the primary strategy. The answer is a layered envelope: shaded courts, thermal mass in earth-based walls, and deep overhangs that modulate sun before it reaches glass.",
      "Interior volumes are porous—breezes move along linear sequences of living, dining, and study spaces, while service cores anchor the plan for quiet sleeping zones. Materials were chosen for hygrothermal performance and craft legibility: lime plaster, oxide floors, and timber screens that age gracefully under sun and rain.",
      "Photovoltaic readiness, rainwater routing, and native planting complete a system-level approach. The result is a quiet, luxurious calm: rooms feel generous without excess square footage, and the landscape reads as an extension of the plan rather than a decorative edge.",
      "For Telangana’s semi-arid climate, the team prioritised orientation studies and mock-ups of wall assemblies before lock-in—reducing rework and helping contractors sequence lime and earth trades without conflict. Shading devices are dimensioned for peak summer altitude, not generic catalogue angles.",
      "Acoustically, sleeping wings are buffered from social zones by storage and circulation, so night-time comfort includes quiet as well as temperature. Daylight is indirect in galleries and direct only where thermal gain can be absorbed by mass or expelled through stack ventilation.",
      "If you are researching comparable houses in South India, use this dossier alongside local ECBC/state amendments, wind-rose data, and geotechnical reports—performance claims should always be validated for your specific site.",
    ],
    extraSpecs: [
      { label: "Climate strategy", value: "Passive cooling first; mixed-mode backup only if needed" },
      { label: "Primary materials", value: "Stabilised earth, lime plaster, oxide flooring, timber screens" },
    ],
    seo: {
      title: "Hyderabad Climate-Smart Earth Residence | Kadthal | Projects | the9thedition",
      description:
        "Net-zero minded Hyderabad-area home: earth walls, shaded courts, lime plaster, and passive cooling—editorial dossier with climate and material notes for South India.",
      keywords: [
        "Hyderabad architecture",
        "earth construction India",
        "passive cooling",
        "courtyard house Telangana",
        "climate responsive residence",
        "Kadthal",
      ],
      geo_region: "Telangana, India",
    },
    faq: [
      {
        question: "What makes this house comfortable without AC as the default?",
        answer:
          "Shaded courts, thermal mass in earth-based walls, deep overhangs, and cross-ventilation paths—validated for local sun paths rather than generic templates.",
      },
      {
        question: "Which Indian climate zone does this design address?",
        answer:
          "Semi-arid / hot-dry conditions typical of Telangana; always cross-check with site-specific wind, humidity, and pollution data.",
      },
      {
        question: "What should I verify before specifying similar materials?",
        answer:
          "Structural engineer sign-off for earth or hybrid walls, lime supplier compatibility, maintenance cycles for timber screens, and PV-ready electrical rough-in.",
      },
    ],
    youtubeUrl: "https://www.youtube.com/watch?v=AySDw78JjqM",
    imageAlts: Array.from({ length: 20 }, (_, j) =>
      j === 0
        ? "Hero — Hyderabad climate-smart earth residence, Kadthal (frame 1 of 20)"
        : j < 8
          ? `Courtyard and envelope detail — Hyderabad residence (frame ${j + 1} of 20)`
          : j < 14
            ? `Interior light and material study — Hyderabad residence (frame ${j + 1} of 20)`
            : `Landscape and roof edge — Hyderabad residence (frame ${j + 1} of 20)`,
    ),
  },

  "kochi-courtyard-craft-memory": {
    dek: "Brick jaalis, reclaimed timber, and handmade tiles frame a refined domestic language rooted in place.",
    paragraphs: [
      "_Text description provided by the architects._ Set within Kochi’s dense fabric, the house negotiates privacy and openness through a sequence of courts and verandah-like edges. Light enters indirectly, bouncing off lime-washed surfaces and carved timber, so interiors stay luminous without glare.",
      "Craft is not ornamental alone—it resolves junctions, screens, and thresholds. Reclaimed wood from an older structure returns as doors and benches, while Athangudi-inspired patterning underfoot anchors rooms in regional colour logic.",
      "Upper levels connect back to the court through bridges and slender walkways, so family life stays visually and acoustically connected. Monsoon readiness shows up in section: slopes, drips, and breathable wall assemblies keep maintenance practical for decades.",
      "Coastal humidity and driving rain require stainless fixings where specified, breathable paints, and careful flashing at roof terraces. The plan keeps service risers compact so courts can stay open without duct clutter.",
      "For Kerala’s seismic and wind context, the structural grid was coordinated early with brick screens so openings read as architecture, not afterthoughts. Acoustic separation between floors uses mass and buffer zones rather than only drywall.",
      "Researchers comparing courtyard typologies in South India should examine water tables, mosquito management, and local tree species—courts succeed when landscape and drainage are designed as one system.",
    ],
    seo: {
      title: "Kochi Courtyard Home — Craft, Brick Jaali & Monsoon Light | Projects | the9thedition",
      description:
        "Editorial dossier: Kochi courtyard residence with reclaimed timber, lime, handmade tiles, and monsoon-resilient section—Kerala architecture reference.",
      keywords: ["Kochi architecture", "courtyard house Kerala", "brick jaali", "monsoon design", "Athangudi tiles"],
      geo_region: "Kerala, India",
    },
    faq: [
      {
        question: "How does the house handle Kerala monsoons?",
        answer:
          "Sloped roofs, drips, breathable walls, and careful terrace flashing—plus section that keeps courts drainable and walkable year-round.",
      },
      {
        question: "Why use reclaimed timber?",
        answer:
          "It reduces embodied carbon, carries narrative depth, and performs when properly treated for termites and humidity.",
      },
      {
        question: "What geographic signals matter for SEO and discovery?",
        answer:
          "Kochi coastal humidity, Kerala craft traditions, and courtyard-based typologies common across the Malabar coast.",
      },
    ],
    youtubeUrl: "https://www.youtube.com/watch?v=wrHbIFQmtL8",
    imageAlts: Array.from({ length: 20 }, (_, j) =>
      j === 0
        ? "Hero — Kochi courtyard home with brick screens (frame 1 of 20)"
        : `Courtyard, stair, or interior craft — Kochi home (frame ${j + 1} of 20)`,
    ),
  },

  "interiors-texture-light-silence": {
    dek: "Layered interiors balance walnut, lime, and quiet light—luxury as restraint rather than excess.",
    paragraphs: [
      "_Text description provided by the architects._ The apartment reads as a sequence of calm chambers where texture does the decorative work: sawn stone underfoot, chalk-lime walls, and walnut joinery tuned to human scale. Artificial light is warm, dimmable, and grazes surfaces instead of flooding them.",
      "Acoustic zoning separates social areas from rest without heavy partitions—rugs, drapery, and ceiling geometry absorb sound where families gather. The kitchen is treated as a workshop: durable counters, honest hardware, and ventilation that keeps cooking smells from migrating.",
      "Bathrooms prioritise maintenance realism: large-format stone, shadow gaps, and concealed cisterns that simplify cleaning. Mirrors and niches are positioned for daily rituals, not photoshoot symmetry alone.",
      "For metropolitan Indian apartments, code-compliant fire egress and MEP risers were coordinated before interior concepts locked—avoiding soffit wars and last-minute grille patches.",
      "If you are sourcing similar palettes in Bengaluru or Mumbai, align stone lots and timber batches early to reduce tonal drift across rooms.",
    ],
    seo: {
      title: "Texture, Light & Silence — Premium Apartment Interiors | Projects | the9thedition",
      description:
        "Interior architecture dossier: walnut, lime, stone, and layered lighting for calm luxury—editorial notes for Indian metro apartments.",
      keywords: ["luxury interiors India", "walnut joinery", "lime plaster walls", "apartment lighting design", "acoustic interiors"],
      geo_region: "India (metro)",
    },
    faq: [
      { question: "How is acoustic comfort achieved in open plans?", answer: "Rugs, drapery, ceiling shaping, and buffer zones—not only partition walls." },
      { question: "What maintenance matters for lime and stone?", answer: "Breathable finishes, shadow gaps, and cleaning protocols that avoid harsh chemicals degrading lime." },
      { question: "Is this suitable for small apartments?", answer: "The principles scale; storage and services must be coordinated early in section." },
    ],
    youtubeUrl: "https://www.youtube.com/watch?v=lOJO1osi9po",
    imageAlts: Array.from({ length: 20 }, (_, j) =>
      j === 0 ? "Hero — layered interior living space (frame 1 of 20)" : `Interior texture and light study (frame ${j + 1} of 20)`,
    ),
  },

  "alibag-nine-courtyards": {
    dek: "A coastal estate unfolds as nine courts—procession, pause, and sea breeze woven into the plan.",
    paragraphs: [
      "_Text description provided by the architects._ The house organises around nine courtyards that regulate privacy, light, and ventilation. Stone passages link social rooms while smaller courts serve bedrooms and service, so every zone has direct sky.",
      "Coastal exposure demanded salt-tolerant metals, careful stone selection, and detailing that sheds wind-driven rain. Overhangs and screens reduce glare while preserving views toward landscaped edges.",
      "Landscape is integral: native species reduce irrigation load, while paved paths keep monsoon mud away from interiors. Pools and water features are positioned with pump noise and chlorination drift away from sleeping wings.",
      "Energy strategy includes solar-ready roofs, efficient pool pumps, and LED layers that respect turtle-friendly coastal ordinances where applicable.",
      "For Alibag’s weekend-home market, security and absentee maintenance shaped automation choices and material robustness.",
    ],
    seo: {
      title: "Alibag Nine-Courtyard Coastal Estate | Maharashtra | Projects | the9thedition",
      description:
        "Large-format coastal residence in Alibag: nine courtyards, salt-air detailing, landscape-integrated planning—Maharashtra architecture dossier.",
      keywords: ["Alibag architecture", "courtyard estate India", "coastal house Maharashtra", "luxury weekend home"],
      geo_region: "Maharashtra, India",
    },
    faq: [
      { question: "How are nine courtyards maintained securely?", answer: "Clear drainage, accessible pavers, and lighting plans that deter intrusion without skyglow." },
      { question: "What about coastal corrosion?", answer: "Specify finishes and fasteners rated for salt air; inspect annually." },
      { question: "Geographic relevance?", answer: "Konkan coast climate, sea breezes, and monsoon wind loads." },
    ],
    youtubeUrl: "https://www.youtube.com/watch?v=AySDw78JjqM",
    imageAlts: Array.from({ length: 20 }, (_, j) =>
      j === 0 ? "Hero — Alibag coastal courtyard estate (frame 1 of 20)" : `Courtyard or coastal facade — Alibag (frame ${j + 1} of 20)`,
    ),
  },

  "kottayam-sun-shade-vernacular": {
    dek: "Sloping roofs and deep overhangs choreograph daylight for a Kottayam home grounded in vernacular intelligence.",
    paragraphs: [
      "_Text description provided by the architects._ The plan respects the slope of the land, reducing cut-fill and preserving mature trees. Roof geometry sheds monsoon water away from walls while creating loft-like volumes inside.",
      "Vernacular references appear in roof tiles and timber rhythm, but structure is contemporary—steel or RCC where spans demand clarity. Screens filter west sun while admitting breezes along the long axis.",
      "Interiors favour breathable finishes and furniture layouts that align with views and cross-ventilation paths. Kitchens and work zones anchor the plan near service entries for practical daily flow.",
      "For Kottayam’s humid tropical climate, mould prevention starts with air paths, correct insulation where needed, and detailing at parapets.",
    ],
    seo: {
      title: "Kottayam Sun & Shade Vernacular Home | Kerala | Projects | the9thedition",
      description:
        "Kerala hillside home: sloping roofs, screened daylight, monsoon-ready section—vernacular-informed contemporary architecture.",
      keywords: ["Kottayam architecture", "Kerala vernacular modern", "sloping roof house", "tropical daylighting"],
      geo_region: "Kerala, India",
    },
    faq: [
      { question: "How is vernacular different from pastiche?", answer: "It borrows climate logic and craft without copying ornamental motifs blindly." },
      { question: "What to verify structurally?", answer: "Roof thrust, tie beams, and wind uplift per IS codes for your site wind speed." },
      { question: "AEO: who is this page for?", answer: "Homeowners, students, and architects researching Kerala residential typologies." },
    ],
    youtubeUrl: "https://www.youtube.com/watch?v=wrHbIFQmtL8",
    imageAlts: Array.from({ length: 20 }, (_, j) =>
      j === 0 ? "Hero — Kottayam vernacular-informed residence (frame 1 of 20)" : `Roof, screen, or interior — Kottayam (frame ${j + 1} of 20)`,
    ),
  },

  "bengaluru-mexican-palette-brutalism": {
    dek: "Terracotta, cobalt, and sculpted plaster bring warmth to a bold Bengaluru apartment interior.",
    paragraphs: [
      "_Text description provided by the architects._ The clients asked for personality without trend-chasing. Arches and thick plaster volumes create rooms that feel carved rather than decorated. Colour is architectural: bands and blocks align with beams and storage.",
      "Services are concealed so walls read cleanly; lighting is layered with dimmers for evening scenes. Bedrooms prioritise blackout and quiet AC placement.",
      "In Bengaluru’s variable water quality, material choices considered staining on light stone and maintenance of pigmented plaster.",
      "For seismic and slab loading in high-rises, heavy elements were vetted structurally before fabrication.",
    ],
    seo: {
      title: "Bengaluru Apartment — Mexican Palette & Sculpted Plaster | Projects | the9thedition",
      description:
        "Bold interior architecture in Bengaluru: colour-blocked plaster, arches, and layered lighting—editorial dossier.",
      keywords: ["Bengaluru interiors", "brutalist apartment India", "coloured plaster", "architectural colour blocking"],
      geo_region: "Karnataka, India",
    },
    faq: [
      { question: "Can bold colours date quickly?", answer: "When tied to architecture—not only accessories—they age as part of the space’s character." },
      { question: "What about resale in Indian metros?", answer: "Quality documentation and reversible services help; bold interiors suit end-user builds most." },
      { question: "GEO focus?", answer: "Bengaluru tech-city apartment context and plateau climate." },
    ],
    youtubeUrl: "https://www.youtube.com/watch?v=lOJO1osi9po",
    imageAlts: Array.from({ length: 20 }, (_, j) =>
      j === 0 ? "Hero — Bengaluru bold interior architecture (frame 1 of 20)" : `Colour, arch, or detail — Bengaluru (frame ${j + 1} of 20)`,
    ),
  },

  "designer-directory-hospitality-interiors": {
    dek: "A editorial survey of studios shaping hospitality interiors across India—materiality, lighting, and narrative.",
    paragraphs: [
      "_Text description provided by the editors._ This directory feature connects readers to practices specialising in hotels, restaurants, and member clubs where acoustics, kitchen logistics, and brand storytelling converge.",
      "Projects highlighted share a discipline: mock-ups for key surfaces, lighting scenes tested at service hours, and FF&E schedules that survive heavy use.",
      "Geographically, coastal humidity, North Indian dust, and metro noise all demand different interior armour—what works in Goa may fail in Delhi without adaptation.",
      "For AEO: teams shortlisting consultants should verify insurance, site supervision bandwidth, and prior hospitality references—not only imagery.",
    ],
    seo: {
      title: "Hospitality Interiors Designer Directory — India | Projects | the9thedition",
      description:
        "Editorial directory: Indian studios leading hospitality interiors—materials, lighting, acoustics, and delivery realism.",
      keywords: ["hospitality interiors India", "restaurant design India", "hotel design consultants", "interior directory"],
      geo_region: "India",
    },
    faq: [
      { question: "How do I choose a hospitality interior firm?", answer: "Check live projects, maintenance outcomes, MEP coordination experience, and on-site supervision." },
      { question: "What SEO topics cluster with this dossier?", answer: "Commercial interiors, F&B acoustics, lighting design, and brand-led spatial narrative." },
      { question: "Is this a single building project?", answer: "It is an editorial compilation; individual commissions vary by studio." },
    ],
    youtubeUrl: "https://www.youtube.com/watch?v=lOJO1osi9po",
    imageAlts: Array.from({ length: 20 }, (_, j) =>
      j === 0 ? "Hero — hospitality interior editorial montage (frame 1 of 20)" : `Hospitality interior vignette (frame ${j + 1} of 20)`,
    ),
  },

  "thrissur-forest-bungalow-mango": {
    dek: "With a courtyard at its heart, this home brings together family, memory, and the rhythms of nature.",
    paragraphs: [
      "_Text description provided by the architects._ The project arises from the relationship between architecture, landscape, and daily life on a generous Kerala plot. The initial challenge was to preserve a mature mango tree at the centre of the site without compromising circulation, light, and structural clarity. The response is a plan organised around a verdant court, with living spaces opening toward filtered daylight and monsoon breezes.",
      "Rubble cladding and mud brick articulate a textured envelope, punctuated by teak openings that carry warmth from room to room. A sloping roof of regional tiles crowns the home, rooting the silhouette in familiar typologies while allowing contemporary planning inside.",
      "Circulation to the upper level resolves around the tree itself: a staircase wraps the trunk, choreographing movement as a slow reveal of branches, shade, and sky.",
      "Integrated into the living volume, quieter spaces for prayer and pause sit beside generous seating for extended family gatherings.",
      "Across seasons, the courtyard becomes the emotional centre—conversations spill outward, fruit falls softly onto stone, and architecture recedes in favour of life.",
    ],
    extraSpecs: [{ label: "Landscape anchor", value: "Existing mango tree retained as central court generator" }],
    seo: {
      title: "Thrissur Forest Bungalow Around a Mango Tree | Kerala | Projects | the9thedition",
      description:
        "Kerala residential architecture: courtyard around a mature mango tree, rubble and mud brick, tiled roof—Thrissur dossier.",
      keywords: ["Thrissur architecture", "courtyard house Kerala", "tree preservation architecture", "mud brick Kerala"],
      geo_region: "Kerala, India",
    },
    faq: [
      { question: "How was the tree protected during construction?", answer: "Root protection zones, crane exclusions, and foundation offsets coordinated with arborists." },
      { question: "What makes courtyards work in Kerala?", answer: "Drainage, termite management, and breathable walls coordinated with planting." },
      { question: "GEO signals?", answer: "Western Ghats proximity, humid tropics, monsoon wind and rain patterns." },
    ],
    youtubeUrl: "https://www.youtube.com/watch?v=wrHbIFQmtL8",
    imageAlts: Array.from({ length: 20 }, (_, j) =>
      j === 0 ? "Hero — Thrissur bungalow around courtyard tree (frame 1 of 20)" : `Court, roof, or interior — Thrissur (frame ${j + 1} of 20)`,
    ),
  },

  "pawna-weekend-rustic-stone": {
    dek: "Rustic stone and wide decks frame weekend life at Pawna—lake breezes and slow time.",
    paragraphs: [
      "_Text description provided by the architects._ The weekend house prioritises durability and low upkeep: stone plinths, covered decks, and interiors that tolerate wet gear and dogs. Views are curated toward the water while keeping privacy from the access road.",
      "Rainwater and greywater strategies align with local regulations; solar thermal or PV may be added as phased upgrades.",
      "Stone masonry uses local labour skills; joints and movement joints are detailed for seismic considerations in the Western Ghats foothills.",
      "For Maharashtra’s second-home market, security when unoccupied shaped shuttering, lighting, and automation choices.",
    ],
    seo: {
      title: "Pawna Lake Weekend Home — Rustic Stone & Decks | Maharashtra | Projects | the9thedition",
      description:
        "Weekend architecture near Pawna: stone, decks, lake views, and maintainable interiors—Sahyadri context dossier.",
      keywords: ["Pawna lake house", "weekend home Maharashtra", "stone weekend villa India", "Sahyadri architecture"],
      geo_region: "Maharashtra, India",
    },
    faq: [
      { question: "What maintenance issues hit lake houses?", answer: "Humidity, insect ingress, and metal corrosion—detailing and coatings matter." },
      { question: "GEO: what region is Pawna?", answer: "Western Maharashtra, Sahyadri foothills, seasonal lake level change." },
      { question: "AEO: best season to visit?", answer: "Post-monsoon and winter for clarity; summer for early mornings and evenings." },
    ],
    youtubeUrl: "https://www.youtube.com/watch?v=AySDw78JjqM",
    imageAlts: Array.from({ length: 20 }, (_, j) =>
      j === 0 ? "Hero — Pawna rustic stone weekend home (frame 1 of 20)" : `Deck, stone, or view — Pawna (frame ${j + 1} of 20)`,
    ),
  },

  "jaipur-haveli-modern-life": {
    dek: "Jaipur’s pink sandstone language meets modern circulation—courtyards, jharokhas, and calm interiors.",
    paragraphs: [
      "_Text description provided by the architects._ The house translates haveli sequences into contemporary family life: arrival court, layered privacy, and upper terraces that catch desert night sky.",
      "Thermal mass and small openings on west faces reduce heat gain; evaporative cooling and ceiling fans anchor comfort before mechanical cooling.",
      "Craft is local: stone carving, lime, and metalwork sourced through workshops the team has long relationships with.",
      "Water scarcity informed planting and greywater reuse where codes allow.",
    ],
    seo: {
      title: "Jaipur Haveli-Inspired Contemporary Home | Rajasthan | Projects | the9thedition",
      description:
        "Desert architecture in Jaipur: sandstone, courts, jharokhas, and passive cooling—Rajasthan residential dossier.",
      keywords: ["Jaipur architecture", "haveli modern India", "sandstone house Rajasthan", "desert passive cooling"],
      geo_region: "Rajasthan, India",
    },
    faq: [
      { question: "How does this address Jaipur heat?", answer: "Mass, orientation, shading, and evaporative strategies suited to hot-dry climate." },
      { question: "Cultural SEO keywords?", answer: "Jaipur craft, haveli typology, Rajasthan stone traditions." },
      { question: "What to verify legally?", answer: "Heritage overlays if applicable, municipal water reuse rules, setback norms." },
    ],
    youtubeUrl: "https://www.youtube.com/watch?v=lOJO1osi9po",
    imageAlts: Array.from({ length: 20 }, (_, j) =>
      j === 0 ? "Hero — Jaipur haveli-informed residence (frame 1 of 20)" : `Stone facade, court, or terrace — Jaipur (frame ${j + 1} of 20)`,
    ),
  },

  "khar-west-fluid-interiors": {
    dek: "Fluid spaces and reflective surfaces expand perceived volume in a Khar West apartment.",
    paragraphs: [
      "_Text description provided by the architects._ Walls curve and slide; storage is continuous so the eye reads long, calm lines. Light reflects off polished stone and lacquer in controlled bands—sparkle without clutter.",
      "Acoustic drapes and soft zones keep an open plan livable next to Mumbai’s traffic noise.",
      "Services integration in older towers required fire-rated enclosures and careful HVAC routing—documented for future maintenance.",
    ],
    seo: {
      title: "Khar West Fluid Apartment Interiors | Mumbai | Projects | the9thedition",
      description:
        "Mumbai coastal apartment: curved plans, reflective materials, and noise-aware open planning—interior architecture dossier.",
      keywords: ["Mumbai apartment interiors", "Khar West home", "open plan acoustics", "luxury apartment India"],
      geo_region: "Maharashtra, India",
    },
    faq: [
      { question: "How is road noise managed?", answer: "Glass specification, seals, drapes, and interior buffering zones." },
      { question: "Coastal corrosion?", answer: "Hardware and aluminium systems rated for marine exposure." },
      { question: "AEO: who benefits?", answer: "Urban buyers optimising tight floor plates without losing luxury feel." },
    ],
    youtubeUrl: "https://www.youtube.com/watch?v=wrHbIFQmtL8",
    imageAlts: Array.from({ length: 20 }, (_, j) =>
      j === 0 ? "Hero — Khar West fluid interior (frame 1 of 20)" : `Curved interior or detail — Mumbai (frame ${j + 1} of 20)`,
    ),
  },

  "chennai-coastal-villa-verandahs": {
    dek: "Deep verandahs and sea-leaning roofs shelter a Chennai coastal villa from sun and salt.",
    paragraphs: [
      "_Text description provided by the architects._ Verandahs act as climate buffers—shade, social space, and a place for plants to thrive. Plan layout keeps bedrooms away from afternoon western sun while capturing morning light.",
      "Materials specify powder-coated aluminium, marine-grade stainless, and stone that tolerates salt spray maintenance cycles.",
      "Storm readiness includes shuttering strategies and drainage at lawns that face monsoon onslaught from the Bay.",
    ],
    seo: {
      title: "Chennai Coastal Villa — Verandahs & Salt-Air Detailing | Projects | the9thedition",
      description:
        "Tamil Nadu coast architecture: verandahs, salt-air materials, storm-aware drainage—Chennai residential dossier.",
      keywords: ["Chennai coastal architecture", "verandah house India", "salt air materials", "Coromandel climate"],
      geo_region: "Tamil Nadu, India",
    },
    faq: [
      { question: "What fails first on the coast?", answer: "Cheap fasteners, untreated steel, and poor drainage at grade." },
      { question: "GEO notes?", answer: "Bay of Bengal humidity, cyclone season, and high solar exposure." },
      { question: "SEO entities?", answer: "Chennai, Coromandel Coast, coastal verandah typology." },
    ],
    youtubeUrl: "https://www.youtube.com/watch?v=AySDw78JjqM",
    imageAlts: Array.from({ length: 20 }, (_, j) =>
      j === 0 ? "Hero — Chennai coastal villa verandahs (frame 1 of 20)" : `Verandah, roof, or interior — Chennai (frame ${j + 1} of 20)`,
    ),
  },

  "rajapalayam-farmhouse-generations": {
    dek: "A farmhouse scales for generations—shared kitchens, separate suites, and land that still works.",
    paragraphs: [
      "_Text description provided by the architects._ The plan separates noisy and quiet generations without isolating them: a large dining heart, satellite sitting rooms, and outdoor cooking near the orchard.",
      "Structure uses vernacular roof logic with modern waterproofing; floors are easy to clean after farm work.",
      "Security, borewell yield, and power backup are part of the architectural brief—not afterthoughts.",
    ],
    seo: {
      title: "Rajapalayam Multi-Generation Farmhouse | Tamil Nadu | Projects | the9thedition",
      description:
        "Rural Tamil Nadu farmhouse architecture: generational planning, durable materials, agrarian context—editorial dossier.",
      keywords: ["Rajapalayam architecture", "farmhouse India generations", "Tamil Nadu rural house", "agrarian architecture"],
      geo_region: "Tamil Nadu, India",
    },
    faq: [
      { question: "How do you plan for joint families?", answer: "Shared kitchens with noise buffers, separate suites, clear circulation." },
      { question: "AEO checklist?", answer: "Water, power, waste, security, and future accessibility." },
      { question: "GEO?", answer: "Interior Tamil Nadu, agrarian edges, hot-humid climate." },
    ],
    youtubeUrl: "https://www.youtube.com/watch?v=lOJO1osi9po",
    imageAlts: Array.from({ length: 20 }, (_, j) =>
      j === 0 ? "Hero — Rajapalayam generational farmhouse (frame 1 of 20)" : `Farm courtyard, roof, or room — Rajapalayam (frame ${j + 1} of 20)`,
    ),
  },

  "birdhouses-kutch-community-towers": {
    dek: "Community bird towers in Kutch weave craft, ecology, and social ritual into vertical sculpture.",
    paragraphs: [
      "_Text description provided by the editors._ These structures support migratory birds and community pride—timber and mud craft traditions inform the silhouette while contemporary engineering ensures stability in high winds.",
      "Interpretation for visitors balances conservation ethics with respectful photography and seasonal access.",
      "Geographically, Kutch’s saline soils and arid climate influence material choices and maintenance schedules.",
    ],
    seo: {
      title: "Kutch Community Bird Towers — Craft & Ecology | Gujarat | Projects | the9thedition",
      description:
        "Cultural architecture in Gujarat: bird towers, craft, ecology, and wind-aware structures—Kutch editorial dossier.",
      keywords: ["Kutch architecture", "bird tower India", "Gujarat craft", "community sculpture India"],
      geo_region: "Gujarat, India",
    },
    faq: [
      { question: "Are these only decorative?", answer: "They shelter birds and carry cultural meaning—engineering varies by site." },
      { question: "GEO keywords?", answer: "Great Rann of Kutch, saline desert, high wind exposure." },
      { question: "AEO: visitor etiquette?", answer: "Follow local guides; avoid disturbing nesting seasons." },
    ],
    youtubeUrl: "https://www.youtube.com/watch?v=AySDw78JjqM",
    imageAlts: Array.from({ length: 20 }, (_, j) =>
      j === 0 ? "Hero — Kutch bird tower craft structure (frame 1 of 20)" : `Tower detail or landscape — Kutch (frame ${j + 1} of 20)`,
    ),
  },

  "courtyards-tropical-luxury-homes": {
    dek: "Tropical luxury through courts—privacy, breeze, and dappled light across several exemplar homes.",
    paragraphs: [
      "_Text description provided by the editors._ This feature synthesises courtyard strategies from multiple commissions: entry sequences, water in courts, and upper bridges that knit families visually.",
      "Climate-wise, courts reduce reliance on ducts by enabling buoyancy ventilation when paired with high vents.",
      "Material palettes favour stone and lime in social zones, and softer finishes in sleeping zones for acoustic calm.",
    ],
    seo: {
      title: "Tropical Luxury Homes — Courtyard Strategies | India | Projects | the9thedition",
      description:
        "Editorial feature: courtyard-based tropical luxury homes in India—climate, privacy, and craft—SEO dossier.",
      keywords: ["tropical luxury homes India", "courtyard villa", "cross ventilation courtyard", "premium residential India"],
      geo_region: "India (tropical)",
    },
    faq: [
      { question: "Do courtyards increase mosquito risk?", answer: "Only if water stagnates—design drainage, fish ponds, and maintenance access." },
      { question: "SEO cluster?", answer: "Courtyard typology, tropical residential architecture, Indian luxury homes." },
      { question: "Is this one house?", answer: "Editorial synthesis; principles apply across multiple sites." },
    ],
    youtubeUrl: "https://www.youtube.com/watch?v=wrHbIFQmtL8",
    imageAlts: Array.from({ length: 20 }, (_, j) =>
      j === 0 ? "Hero — tropical courtyard luxury editorial (frame 1 of 20)" : `Courtyard vignette (frame ${j + 1} of 20)`,
    ),
  },

  "celebrity-homes-art-decisions": {
    dek: "How public figures curate art and architecture—privacy, security, and collection conservation.",
    paragraphs: [
      "_Text description provided by the editors._ Celebrity residences balance media exposure with family safety: access control, visitor paths, and HVAC that protects artwork.",
      "Lighting design considers photography glare, UV control, and flexible scenes for events.",
      "Legally, image rights and location privacy interact with architecture—professional teams coordinate NDAs and press protocols.",
    ],
    seo: {
      title: "Celebrity Homes — Art, Privacy & Architecture | India | Projects | the9thedition",
      description:
        "Editorial dossier on celebrity residences in India: art conservation, security, lighting, and privacy-by-design.",
      keywords: ["celebrity homes India", "art collection lighting", "secure luxury residence", "private gallery home"],
      geo_region: "India",
    },
    faq: [
      { question: "What makes art-safe lighting?", answer: "UV filtering, lux limits, and scene control—not only decorative fixtures." },
      { question: "AEO: security layers?", answer: "Zoning, access paths, surveillance integration without prison-like feel." },
      { question: "GEO relevance?", answer: "Metro India contexts with paparazzi and high net worth security norms." },
    ],
    youtubeUrl: "https://www.youtube.com/watch?v=lOJO1osi9po",
    imageAlts: Array.from({ length: 20 }, (_, j) =>
      j === 0 ? "Hero — celebrity home art and architecture editorial (frame 1 of 20)" : `Gallery-like interior vignette (frame ${j + 1} of 20)`,
    ),
  },

  "temple-architecture-modern-gallery": {
    dek: "Temple architecture informs a contemporary gallery—ritual sequence, light, and stone silence.",
    paragraphs: [
      "_Text description provided by the editors._ The gallery borrows axial clarity and changing light from sacred precedents without religious pastiche. Stone floors and plaster walls create acoustic calm for installations.",
      "Climate systems protect art while keeping visitor comfort; circulation separates freight from public routes.",
      "GEO: South Indian temple town contexts influence material palettes and local contractor capabilities.",
    ],
    seo: {
      title: "Modern Gallery Informed by Temple Architecture | India | Projects | the9thedition",
      description:
        "Cultural architecture: gallery space, temple-informed procession and light—India arts dossier with SEO entities.",
      keywords: ["temple architecture gallery", "museum India contemporary", "sacred space contemporary art", "stone gallery India"],
      geo_region: "India",
    },
    faq: [
      { question: "Is this a religious building?", answer: "No—it translates spatial lessons into a secular cultural programme." },
      { question: "AEO: who visits?", answer: "Art audiences, students of architecture, and cultural tourists." },
      { question: "GEO keywords?", answer: "Indian temple towns, stone craft regions, cultural tourism." },
    ],
    youtubeUrl: "https://www.youtube.com/watch?v=AySDw78JjqM",
    imageAlts: Array.from({ length: 20 }, (_, j) =>
      j === 0 ? "Hero — temple-informed modern gallery (frame 1 of 20)" : `Gallery hall or stone detail (frame ${j + 1} of 20)`,
    ),
  },

  "portrait-artist-studios": {
    dek: "North light, tall volume, and quiet services define portrait studios where concentration is a material.",
    paragraphs: [
      "_Text description provided by the editors._ Studios prioritise spectral quality of light, wall neutrality, and acoustic isolation from urban noise. Storage for canvases and wet work zones are separated with safety in mind.",
      "Mechanical ventilation addresses solvent use where applicable per codes.",
      "For Indian metros, humidity swings inform canvas storage and HVAC selection.",
    ],
    seo: {
      title: "Portrait Artist Studios — Light, Volume & Quiet | India | Projects | the9thedition",
      description:
        "Workspace architecture for portrait artists: north light, tall studios, solvent-aware ventilation—India editorial dossier.",
      keywords: ["artist studio architecture India", "north light studio", "atelier design", "creative workspace"],
      geo_region: "India (metro)",
    },
    faq: [
      { question: "Why north light?", answer: "Even, indirect daylight reduces harsh shadows for figurative work—subject to site orientation." },
      { question: "AEO: safety?", answer: "Solvent storage, fire codes, and ventilation must be professionally coordinated." },
      { question: "SEO intent?", answer: "Artists and architects searching studio planning keywords." },
    ],
    youtubeUrl: "https://www.youtube.com/watch?v=wrHbIFQmtL8",
    imageAlts: Array.from({ length: 20 }, (_, j) =>
      j === 0 ? "Hero — portrait artist studio volume and light (frame 1 of 20)" : `Studio wall, skylight, or storage (frame ${j + 1} of 20)`,
    ),
  },

  "biennale-cities-design-destinations": {
    dek: "Cities on the global design circuit—pavilions, waterfronts, and walkable culture clusters.",
    paragraphs: [
      "_Text description provided by the editors._ This dossier maps destinations where biennales concentrate temporary architecture, public life, and design discourse. Urban mobility, hotel capacity, and heritage sensitivity shape visitor experience.",
      "For travellers planning study trips, combine major venues with smaller craft districts for grounded context.",
      "SEO/AEO: queries like “architecture biennale cities” should land on structured summaries with dates and official links—verify annually.",
    ],
    seo: {
      title: "Biennale Cities & Design Destinations | Global | Projects | the9thedition",
      description:
        "Editorial travel architecture dossier: biennale cities, walkable culture, waterfront venues—GEO-tagged discovery content.",
      keywords: ["architecture biennale cities", "design tourism", "architecture travel", "cultural waterfront districts"],
      geo_region: "Global",
    },
    faq: [
      { question: "Which cities host major architecture events?", answer: "Rotates—check official biennale calendars; this page is editorial, not an official schedule." },
      { question: "AEO: planning a trip?", answer: "Book early, mix pavilions with local building culture, and verify visa rules." },
      { question: "GEO scope?", answer: "Multi-region; use filters for Europe, Asia, and Americas when we expand listings." },
    ],
    youtubeUrl: "https://www.youtube.com/watch?v=lOJO1osi9po",
    imageAlts: Array.from({ length: 20 }, (_, j) =>
      j === 0 ? "Hero — biennale city waterfront editorial (frame 1 of 20)" : `Urban design destination vignette (frame ${j + 1} of 20)`,
    ),
  },
};

export function getProjectLongForm(slug: string): ProjectLongForm | undefined {
  return PROJECT_LONG_FORM_BY_SLUG[slug];
}
