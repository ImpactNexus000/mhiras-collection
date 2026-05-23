import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * Rate limiting via Upstash Redis. When the env vars are missing (local dev
 * without an Upstash instance) every check returns `success: true` — the app
 * stays usable, but production must set both vars.
 */

const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

const redis =
  REDIS_URL && REDIS_TOKEN
    ? new Redis({ url: REDIS_URL, token: REDIS_TOKEN })
    : null;

function buildLimiter(limit: number, window: `${number} ${"s" | "m" | "h"}`) {
  if (!redis) return null;
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(limit, window),
    analytics: true,
    prefix: "mhiras",
  });
}

/** Sign-in / sign-up — protect against credential stuffing. */
export const authLimiter = buildLimiter(5, "15 m");

/** Order placement + payment init — keep at human pace. */
export const checkoutLimiter = buildLimiter(10, "1 h");

/** Admin image upload — generous for bulk listing days. */
export const uploadLimiter = buildLimiter(60, "1 h");

/** Generic write endpoints (stockpile delivery requests, etc.). */
export const generalLimiter = buildLimiter(30, "1 h");

/**
 * Pull a best-effort client IP from request headers. Vercel sets
 * `x-forwarded-for`; falls back to other common proxy headers and finally
 * to a constant so we never identify two anonymous clients as the same
 * empty string.
 */
export function getClientIp(headers: Headers): string {
  const xff = headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return (
    headers.get("x-real-ip") ??
    headers.get("cf-connecting-ip") ??
    "anonymous"
  );
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  reset: number;
}

/**
 * Run a limiter against a stable identifier (IP, userId, or `${ip}:${userId}`).
 * Returns `success: true` if the limiter is disabled — callers don't need to
 * branch on configuration.
 */
export async function checkRateLimit(
  limiter: Ratelimit | null,
  identifier: string
): Promise<RateLimitResult> {
  if (!limiter) return { success: true, remaining: -1, reset: 0 };
  const { success, remaining, reset } = await limiter.limit(identifier);
  return { success, remaining, reset };
}
