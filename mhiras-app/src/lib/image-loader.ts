"use client";

/**
 * Global next/image loader (configured in next.config.ts).
 *
 * Cloudinary URLs get an `f_auto, q_auto, w_<width>, c_limit` transform so
 * each srcset entry asks Cloudinary for a properly sized WebP/AVIF. Local
 * /public assets are returned unchanged — setting `images.loader: "custom"`
 * disables Next's built-in `/_next/image` endpoint, so there's nothing to
 * delegate to. Pair local <Image> instances with `unoptimized` to skip the
 * (now redundant) srcset.
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
  return src;
}
