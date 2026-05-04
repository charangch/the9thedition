type Entry = { count: number; resetAt: number };

const store = new Map<string, Entry>();

export function rateLimit(
  key: string,
  opts: { limit: number; windowMs: number },
): { ok: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const existing = store.get(key);
  if (!existing || existing.resetAt <= now) {
    const next = { count: 1, resetAt: now + opts.windowMs };
    store.set(key, next);
    return { ok: true, remaining: Math.max(0, opts.limit - 1), resetAt: next.resetAt };
  }

  existing.count += 1;
  store.set(key, existing);
  const remaining = Math.max(0, opts.limit - existing.count);
  return { ok: existing.count <= opts.limit, remaining, resetAt: existing.resetAt };
}

export function clientIp(request: Request): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip") || "unknown";
}
