import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Loose email shape check — catches typos, not RFC-complete. */
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_RE.test(email);
}

/**
 * Canonical form for storing and looking up emails. Email addresses are
 * case-insensitive in practice, but Postgres equality is not — so we must
 * lowercase (and trim) consistently at every write and lookup, or a row
 * stored as `Foo@x.com` becomes invisible to a `foo@x.com` lookup.
 */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

/** Time-of-day, e.g. "3:30 PM". Pairs with formatDate for date + time displays. */
export function formatTime(date: Date | string): string {
  return new Intl.DateTimeFormat("en-NG", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}
