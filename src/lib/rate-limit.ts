// Simple in-memory fixed-window rate limiter.
// Suitable for a single-instance deployment (local dev / single Vercel instance).
// For multi-instance production, swap with a shared store (e.g. Upstash Redis).

interface Entry {
  count: number;
  resetAt: number;
}

const store = new Map<string, Entry>();

const MAX_KEYS = 10_000;

function pruneExpired(now: number) {
  for (const [key, entry] of store) {
    if (entry.resetAt <= now) store.delete(key);
  }
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  /** seconds until the window resets (only when blocked) */
  retryAfter?: number;
}

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  if (store.size > MAX_KEYS) pruneExpired(now);

  const entry = store.get(key);
  if (!entry || entry.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: limit - 1 };
  }

  entry.count += 1;
  if (entry.count > limit) {
    return {
      success: false,
      remaining: 0,
      retryAfter: Math.ceil((entry.resetAt - now) / 1000),
    };
  }
  return { success: true, remaining: limit - entry.count };
}

export function resetRateLimit(key: string): void {
  store.delete(key);
}

export function getClientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}
