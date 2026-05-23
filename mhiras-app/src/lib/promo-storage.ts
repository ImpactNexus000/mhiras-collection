/**
 * Shared sessionStorage handoff for a promo code applied in the cart and
 * automatically picked up by checkout. Keeping this in one module guarantees
 * cart and checkout-form agree on the storage key + shape.
 */

const KEY = "mhiras-applied-promo-v1";

export interface AppliedPromo {
  code: string;
  /** Cached at apply-time for display; checkout re-validates server-side. */
  discount: number;
  freeDelivery: boolean;
  message: string;
}

export function readAppliedPromo(): AppliedPromo | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed?.code !== "string") return null;
    return parsed as AppliedPromo;
  } catch {
    return null;
  }
}

export function writeAppliedPromo(promo: AppliedPromo) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(KEY, JSON.stringify(promo));
}

export function clearAppliedPromo() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(KEY);
}
