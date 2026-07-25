import { createInsForgeServerClientPublicOrNull } from "@/lib/insforge-server";

/**
 * Persistent like totals for `/api/public/likes`.
 * Uses InsForge `content_likes` when available, with an in-process Map fallback.
 */

type GlobalLikeMap = typeof globalThis & { __t9eLikeCounts?: Map<string, number> };

function memoryMap(): Map<string, number> {
  const g = globalThis as GlobalLikeMap;
  if (!g.__t9eLikeCounts) g.__t9eLikeCounts = new Map();
  return g.__t9eLikeCounts;
}

export async function getLikeCount(target: string): Promise<number> {
  const client = createInsForgeServerClientPublicOrNull();
  if (client) {
    try {
      const { data, error } = await client.database
        .from("content_likes")
        .select("count")
        .eq("target", target)
        .limit(1);
      if (!error) {
        const row = Array.isArray(data) ? data[0] : data;
        const count = (row as { count?: number } | undefined)?.count;
        if (typeof count === "number") return Math.max(0, count);
        return 0;
      }
    } catch {
      /* fall through */
    }
  }
  return memoryMap().get(target) ?? 0;
}

/** Returns the new total after applying delta (+1 like / -1 unlike). */
export async function adjustLikeCount(target: string, delta: number): Promise<number> {
  const client = createInsForgeServerClientPublicOrNull();
  if (client) {
    try {
      const { data: rpcData, error: rpcError } = await client.database.rpc("adjust_content_like", {
        p_target: target,
        p_delta: delta,
      });
      if (!rpcError && typeof rpcData === "number") {
        return Math.max(0, rpcData);
      }

      const current = await getLikeCount(target);
      const next = Math.max(0, current + delta);
      const { error } = await client.database.from("content_likes").upsert(
        { target, count: next, updated_at: new Date().toISOString() },
        { onConflict: "target" },
      );
      if (!error) return next;
    } catch {
      /* fall through */
    }
  }

  const m = memoryMap();
  const next = Math.max(0, (m.get(target) ?? 0) + delta);
  m.set(target, next);
  return next;
}
