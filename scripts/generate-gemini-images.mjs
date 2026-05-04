/**
 * Optional: batch-generate raster images with Gemini / Imagen and upload to your storage.
 * The site ships with deterministic SVGs from /api/generated-image (no API key required).
 *
 * Usage (when you wire an API):
 *   GEMINI_API_KEY=... node scripts/generate-gemini-images.mjs --collection=articles --limit=5
 *
 * This stub exits 0 and prints next steps so CI does not fail.
 */
console.log(
  "[generate-gemini-images] Not configured: add Gemini/Imagen calls here or keep using /api/generated-image for zero-egress on-site graphics.",
);
process.exit(0);
