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

/**
 * Admin image upload. Sized for the bulk-upload screen: a full 60-product
 * batch with a few angles each can fire several hundred uploads in minutes,
 * and a listing day is often two or three of those back to back.
 */
export const uploadLimiter = buildLimiter(400, "1 h");

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

/** Give up on Redis after this long and let the request through. */
const LIMITER_TIMEOUT_MS = 2_000;

/** The "we couldn't check, so allow it" result. */
function allow(): RateLimitResult {
  return { success: true, remaining: -1, reset: 0 };
}

/**
 * Run a limiter against a stable identifier (IP, userId, or `${ip}:${userId}`).
 * Returns `success: true` if the limiter is disabled — callers don't need to
 * branch on configuration.
 *
 * Fails **open** on any limiter failure, deliberately. Upstash deletes free
 * databases after 14 days of inactivity; when that happened every `limit()`
 * call rejected, and because this is the first statement in both the
 * credentials `authorize()` and `requestPasswordReset()`, a throw here locked
 * every user out of sign-in *and* password reset simultaneously. A rate
 * limiter is a guard rail — losing it should cost us protection, never
 * availability. The timeout covers the same failure mode's slow variant: a
 * Redis that hangs instead of rejecting would otherwise hang sign-in.
 */
export async function checkRateLimit(
  limiter: Ratelimit | null,
  identifier: string
): Promise<RateLimitResult> {
  if (!limiter) return allow();

  let timer: ReturnType<typeof setTimeout> | undefined;

  try {
    const result = await Promise.race([
      limiter.limit(identifier),
      new Promise<null>((resolve) => {
        timer = setTimeout(() => resolve(null), LIMITER_TIMEOUT_MS);
      }),
    ]);

    if (!result) {
      console.error(
        `[rate-limit] timed out after ${LIMITER_TIMEOUT_MS}ms — allowing "${identifier}"`
      );
      return allow();
    }

    const { success, remaining, reset } = result;
    return { success, remaining, reset };
  } catch (error) {
    console.error(
      `[rate-limit] limiter unavailable — allowing "${identifier}"`,
      error
    );
    return allow();
  } finally {
    clearTimeout(timer);
  }
}
