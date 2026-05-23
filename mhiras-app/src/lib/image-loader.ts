"use client";

/**
 * Global next/image loader (configured in next.config.ts).
 *
 * - For Cloudinary URLs (`res.cloudinary.com`), rewrites the URL with the
 *   f_auto, q_auto, w_<width>, c_limit transformations so each srcset entry
 *   asks Cloudinary for a properly sized WebP/AVIF.
 * - For anything else (local /public assets, etc.) we delegate to Next's
 *   built-in optimizer at /_next/image so those still get resized + cached.
 *
 * Replacing the global loader is the only way to use a function-valued
 * loader, since passing `loader={...}` directly from a Server Component
 * fails ("Functions cannot be passed directly to Client Components").
 */
export default function imageLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}): string {
  if (src.includes("res.cloudinary.com")) {
    const q = quality ?? "auto";
    return src.replace(
      "/upload/",
      `/upload/f_auto,q_${q},w_${width},c_limit/`
    );
  }
  const q = quality ?? 75;
  return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=${q}`;
}
