/**
 * In-process like totals for `/api/public/likes`.
 * Survives across requests in `next dev` / `next start` (single Node process).
 * For production at scale, replace with a database row per `target`.
 */

type GlobalLikeMap = typeof globalThis & { __t9eLikeCounts?: Map<string, number> };

function map(): Map<string, number> {
  const g = globalThis as GlobalLikeMap;
  if (!g.__t9eLikeCounts) {
    g.__t9eLikeCounts = new Map();
  }
  return g.__t9eLikeCounts;
}

export function getLikeCount(target: string): number {
  return map().get(target) ?? 0;
}

/** Returns the new total. */
export function adjustLikeCount(target: string, delta: number): number {
  const m = map();
  const next = Math.max(0, getLikeCount(target) + delta);
  m.set(target, next);
  return next;
}
