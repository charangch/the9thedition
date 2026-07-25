import { createInsForgeServerClientPublicOrNull } from "@/lib/insforge-server";

/**
 * Persistent like totals for `/api/public/likes`.
 * Uses InsForge `content_likes` (+ `adjust_content_like` RPC) when available,
 * with an in-process Map fallback so the UI never hard-fails.
 */

type GlobalLikeMap = typeof globalThis & { __t9eLikeCounts?: Map<string, number> };

function memoryMap(): Map<string, number> {
  const g = globalThis as GlobalLikeMap;
  if (!g.__t9eLikeCounts) g.__t9eLikeCounts = new Map();
  return g.__t9eLikeCounts;
}

function asCount(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return Math.max(0, Math.trunc(value));
  if (typeof value === "string" && value.trim() !== "" && Number.isFinite(Number(value))) {
    return Math.max(0, Math.trunc(Number(value)));
  }
  return null;
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
        const count = asCount((row as { count?: unknown } | undefined)?.count);
        if (count != null) return count;
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
      const rpcCount = asCount(rpcData);
      if (!rpcError && rpcCount != null) return rpcCount;

      const current = await getLikeCount(target);
      const next = Math.max(0, current + delta);

      const { data: updated, error: updateError } = await client.database
        .from("content_likes")
        .update({ count: next })
        .eq("target", target)
        .select("count");
      if (!updateError) {
        const rows = Array.isArray(updated) ? updated : updated ? [updated] : [];
        if (rows.length > 0) return next;
      }

      const { error: insertError } = await client.database
        .from("content_likes")
        .insert({ target, count: next });
      if (!insertError) return next;

      const { error: upsertError } = await client.database
        .from("content_likes")
        .upsert({ target, count: next }, { onConflict: "target" });
      if (!upsertError) return next;
    } catch {
      /* fall through to memory */
    }
  }

  const m = memoryMap();
  const next = Math.max(0, (m.get(target) ?? 0) + delta);
  m.set(target, next);
  return next;
}
