/**
 * Luxury architecture image sets — 6 frames per slug, one building each.
 * Sources: validated Unsplash URLs only (not ArchDaily / Dezeen / etc.).
 */

const VALID_EXTERIOR = [
  "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd",
  "https://images.unsplash.com/photo-1494526585095-c41746248156",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
  "https://images.unsplash.com/photo-1600607687644-c7171b42498f",
  "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b",
  "https://images.unsplash.com/photo-1613977257363-707ba9348227",
  "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d",
  "https://images.unsplash.com/photo-1484154218962-a197022b5858",
  "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0",
  "https://images.unsplash.com/photo-1616593969747-4797dc75033e",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c",
  "https://images.unsplash.com/photo-1600573472550-8090b5e0745e",
  "https://images.unsplash.com/photo-1600607688969-a5bfcd646154",
  "https://images.unsplash.com/photo-1511818966892-d7d671e672a2",
  "https://images.unsplash.com/photo-1464146072230-91cabc968266",
  "https://images.unsplash.com/photo-1483366774565-c783b9f70e2c",
  "https://images.unsplash.com/photo-1479839672679-a46483c0e7c8",
  "https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6",
  "https://images.unsplash.com/photo-1523217582562-09d0def993a6",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688",
  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6",
  "https://images.unsplash.com/photo-1600607687126-8a3414349a51",
  "https://images.unsplash.com/photo-1600585154526-990dced4db0d",
  "https://images.unsplash.com/photo-1600210491369-e753d80a41f3",
  "https://images.unsplash.com/photo-1600573472591-ee6b68d14c68",
  "https://images.unsplash.com/photo-1600047509358-9dc75507daeb",
  "https://images.unsplash.com/photo-1600047509782-20d39509f26d",
  "https://images.unsplash.com/photo-1582582621959-48d27397dc69",
  "https://images.unsplash.com/photo-1581539250439-c96689b516dd",
  "https://images.unsplash.com/photo-1554995207-c18c203602cb",
  "https://images.unsplash.com/photo-1487958449943-2429e8be8625",
  "https://images.unsplash.com/photo-1560518883-ce09059eeffa",
  "https://images.unsplash.com/photo-1600566752355-35792bedcfea",
  "https://images.unsplash.com/photo-1616486029423-aaa4789e8c9a",
  "https://images.unsplash.com/photo-1489515217757-5fd1be406fef",
  "https://images.unsplash.com/photo-1524492412937-b28074a5d7da",
  "https://images.unsplash.com/photo-1513364776144-60967b0f800f",
  "https://images.unsplash.com/photo-1518998053901-5348d3961a04",
  "https://images.unsplash.com/photo-1449844908441-8829872d2607",
  "https://images.unsplash.com/photo-1501183638710-841dd1904471",
  "https://images.unsplash.com/photo-1568605114967-8130f3a36994",
  "https://images.unsplash.com/photo-1600585152915-d208bec867a1",
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9",
  "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6",
  "https://images.unsplash.com/photo-1580587771525-78b9dba3b914",
  "https://images.unsplash.com/photo-1600585154084-4e5fe7c39198",
  "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea",
];

/** Same-shoot luxury homes (padded to 6 with rotation). */
const MULTI_PHOTO_SETS = [
  [
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
    "https://images.unsplash.com/photo-1600585154526-990dced4db0d",
    "https://images.unsplash.com/photo-1600585152915-d208bec867a1",
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9",
    "https://images.unsplash.com/photo-1600585154084-4e5fe7c39198",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
  ],
  [
    "https://images.unsplash.com/photo-1600607687644-c7171b42498f",
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c",
    "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d",
    "https://images.unsplash.com/photo-1600607688969-a5bfcd646154",
    "https://images.unsplash.com/photo-1600607687126-8a3414349a51",
    "https://images.unsplash.com/photo-1600607687644-c7171b42498f",
  ],
  [
    "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b",
    "https://images.unsplash.com/photo-1600566752355-35792bedcfea",
    "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea",
    "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b",
    "https://images.unsplash.com/photo-1600566752355-35792bedcfea",
    "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea",
  ],
];

const CROP_FRAMES = [
  { x: 0.18, y: 0.22, z: 1.15 },
  { x: 0.82, y: 0.2, z: 1.2 },
  { x: 0.5, y: 0.45, z: 1.0 },
  { x: 0.25, y: 0.78, z: 1.25 },
  { x: 0.75, y: 0.72, z: 1.18 },
  { x: 0.5, y: 0.12, z: 1.3 },
];

function cropVariants(base) {
  const root = base.split("?")[0];
  return CROP_FRAMES.map(({ x, y, z }) => {
    const u = new URL(root);
    u.searchParams.set("auto", "format");
    u.searchParams.set("fit", "crop");
    u.searchParams.set("w", "1600");
    u.searchParams.set("h", "900");
    u.searchParams.set("q", "82");
    u.searchParams.set("fm", "jpg");
    u.searchParams.set("crop", "focalpoint");
    u.searchParams.set("fp-x", String(x));
    u.searchParams.set("fp-y", String(y));
    u.searchParams.set("fp-z", String(z));
    return u.toString();
  });
}

export function hashSlug(slug) {
  let h = 2166136261;
  for (let i = 0; i < slug.length; i += 1) {
    h ^= slug.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

/** Six download URLs for one slug — same luxury building throughout. */
export function buildingSetForSlug(slug) {
  const h = hashSlug(slug);
  if (h % 5 === 0 && MULTI_PHOTO_SETS.length) {
    return MULTI_PHOTO_SETS[h % MULTI_PHOTO_SETS.length];
  }
  const photo = VALID_EXTERIOR[(h + Math.floor(h / 7)) % VALID_EXTERIOR.length];
  return cropVariants(photo);
}

export const BUILDING_SETS = [...MULTI_PHOTO_SETS, ...VALID_EXTERIOR.map((p) => cropVariants(p))];
