/**
 * Canonical site URL, used for SEO metadata, sitemap and robots.
 *
 * Set NEXT_PUBLIC_APP_URL to the real production domain before launch —
 * the fallback below is only a placeholder for development.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_APP_URL ?? "https://mhirascollection.com"
).replace(/\/$/, "");

export const SITE_NAME = "Mhiras Collection";
