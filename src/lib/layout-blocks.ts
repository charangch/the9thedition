export type HeroImageBlock = {
  id: string;
  type: "HeroImage";
  title?: string;
  subtitle?: string;
  imageUrl: string;
};

export type EditorialTextBlock = {
  id: string;
  type: "EditorialText";
  heading?: string;
  body: string;
};

export type MasonryGalleryBlock = {
  id: string;
  type: "MasonryGallery";
  images: { url: string; caption?: string }[];
};

export type ProjectFactSheetBlock = {
  id: string;
  type: "ProjectFactSheet";
  facts: { label: string; value: string }[];
};

export type AdSlotBlock = {
  id: string;
  type: "AdSlot";
  title?: string;
  imageUrl?: string;
  ctaText?: string;
  ctaUrl?: string;
};

export type LeadInquiryFormBlock = {
  id: string;
  type: "LeadInquiryForm";
  heading?: string;
};

export type LayoutBlock =
  | HeroImageBlock
  | EditorialTextBlock
  | MasonryGalleryBlock
  | ProjectFactSheetBlock
  | AdSlotBlock
  | LeadInquiryFormBlock;

function blockId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

export function normalizeLayoutBlocks(input: unknown): LayoutBlock[] {
  if (!Array.isArray(input)) return [];
  const out: LayoutBlock[] = [];
  for (const raw of input) {
    if (!raw || typeof raw !== "object") continue;
    const block = raw as Record<string, unknown>;
    const id = typeof block.id === "string" && block.id ? block.id : blockId("blk");
    const type = block.type;
    if (type === "HeroImage") {
      out.push({
        id,
        type,
        title: typeof block.title === "string" ? block.title : undefined,
        subtitle: typeof block.subtitle === "string" ? block.subtitle : undefined,
        imageUrl: typeof block.imageUrl === "string" ? block.imageUrl : "",
      } satisfies HeroImageBlock);
      continue;
    }
    if (type === "EditorialText") {
      out.push({
        id,
        type,
        heading: typeof block.heading === "string" ? block.heading : undefined,
        body: typeof block.body === "string" ? block.body : "",
      } satisfies EditorialTextBlock);
      continue;
    }
    if (type === "MasonryGallery") {
      const images: MasonryGalleryBlock["images"] = Array.isArray(block.images)
        ? block.images.flatMap((item) => {
            if (!item || typeof item !== "object") return [];
            const obj = item as Record<string, unknown>;
            const url = typeof obj.url === "string" ? obj.url : "";
            if (!url) return [];
            return [
              {
                url,
                caption: typeof obj.caption === "string" ? obj.caption : undefined,
              },
            ];
          })
        : [];
      out.push({ id, type, images } satisfies MasonryGalleryBlock);
      continue;
    }
    if (type === "ProjectFactSheet") {
      const facts = Array.isArray(block.facts)
        ? block.facts
            .map((item) => {
              if (!item || typeof item !== "object") return null;
              const obj = item as Record<string, unknown>;
              return {
                label: typeof obj.label === "string" ? obj.label : "",
                value: typeof obj.value === "string" ? obj.value : "",
              };
            })
            .filter((v): v is { label: string; value: string } => Boolean(v?.label && v?.value))
        : [];
      out.push({ id, type, facts } satisfies ProjectFactSheetBlock);
      continue;
    }
    if (type === "AdSlot") {
      out.push({
        id,
        type,
        title: typeof block.title === "string" ? block.title : undefined,
        imageUrl: typeof block.imageUrl === "string" ? block.imageUrl : undefined,
        ctaText: typeof block.ctaText === "string" ? block.ctaText : undefined,
        ctaUrl: typeof block.ctaUrl === "string" ? block.ctaUrl : undefined,
      } satisfies AdSlotBlock);
      continue;
    }
    if (type === "LeadInquiryForm") {
      out.push({
        id,
        type,
        heading: typeof block.heading === "string" ? block.heading : undefined,
      } satisfies LeadInquiryFormBlock);
    }
  }
  return out;
}

export function defaultLayoutBlocks(params: {
  title: string;
  body: string;
  imageUrls?: string[];
  facts?: { label: string; value: string }[];
}): LayoutBlock[] {
  const firstImage = params.imageUrls?.[0] ?? "";
  return [
    {
      id: blockId("hero"),
      type: "HeroImage",
      title: params.title,
      subtitle: "Curated by the9thedition",
      imageUrl: firstImage,
    },
    {
      id: blockId("editorial"),
      type: "EditorialText",
      heading: "Editorial Overview",
      body: params.body,
    },
    {
      id: blockId("gallery"),
      type: "MasonryGallery",
      images: (params.imageUrls ?? []).slice(0, 12).map((url) => ({ url })),
    },
    {
      id: blockId("facts"),
      type: "ProjectFactSheet",
      facts: params.facts ?? [],
    },
    {
      id: blockId("lead"),
      type: "LeadInquiryForm",
      heading: "Enquire about this project",
    },
  ];
}

