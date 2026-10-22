const hits = new Map<string, { count: number; resetAt: number }>();
const MAX_KEYS = 10_000;
// Best-effort per-instance throttle for public routes; admin login uses Postgres.
export function rateLimit(key: string, limit = 60, windowMs = 60_000) {
  const now = Date.now();
  const current = hits.get(key);
  if (!current || current.resetAt <= now) {
    if (hits.size >= MAX_KEYS) {
      for (const [k, value] of hits) if (value.resetAt <= now) hits.delete(k);
      if (hits.size >= MAX_KEYS && !hits.has(key)) return false;
    }
    hits.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  current.count += 1;
  return current.count <= limit;
}
