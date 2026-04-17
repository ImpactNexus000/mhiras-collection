const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME!;
const API_KEY = process.env.CLOUDINARY_API_KEY!;
const API_SECRET = process.env.CLOUDINARY_API_SECRET!;

interface UploadResult {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

/**
 * Upload an image to Cloudinary via their unsigned REST API.
 * Files are stored in the "mhiras/products" folder.
 */
export async function uploadImage(file: File): Promise<UploadResult> {
  const timestamp = Math.floor(Date.now() / 1000);
  const folder = "mhiras/products";

  // Generate signature for authenticated upload
  const params = `folder=${folder}&timestamp=${timestamp}`;
  const encoder = new TextEncoder();
  const key = encoder.encode(API_SECRET);
  const data = encoder.encode(params);

  // Use Web Crypto API for HMAC-SHA256... but Cloudinary uses SHA-1 signature
  // Cloudinary signature = sha1(params + api_secret)
  const { createHash } = await import("crypto");
  const signature = createHash("sha1")
    .update(params + API_SECRET)
    .digest("hex");

  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);
  formData.append("timestamp", String(timestamp));
  formData.append("api_key", API_KEY);
  formData.append("signature", signature);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: "POST", body: formData }
  );

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Cloudinary upload failed: ${error}`);
  }

  return res.json();
}

/**
 * Delete an image from Cloudinary by public_id.
 */
export async function deleteImage(publicId: string): Promise<void> {
  const timestamp = Math.floor(Date.now() / 1000);

  const { createHash } = await import("crypto");
  const params = `public_id=${publicId}&timestamp=${timestamp}`;
  const signature = createHash("sha1")
    .update(params + API_SECRET)
    .digest("hex");

  const formData = new FormData();
  formData.append("public_id", publicId);
  formData.append("timestamp", String(timestamp));
  formData.append("api_key", API_KEY);
  formData.append("signature", signature);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/destroy`,
    { method: "POST", body: formData }
  );

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Cloudinary delete failed: ${error}`);
  }
}

/**
 * Generate an optimized Cloudinary URL with transformations.
 * Returns a URL that serves WebP/AVIF, auto-quality, and resized images.
 */
export function getOptimizedUrl(
  url: string,
  options: { width?: number; height?: number; crop?: string } = {}
): string {
  const { width, height, crop = "fill" } = options;

  // Only transform Cloudinary URLs
  if (!url.includes("res.cloudinary.com")) return url;

  // Insert transformation before /upload/
  const transforms: string[] = ["f_auto", "q_auto"];
  if (width) transforms.push(`w_${width}`);
  if (height) transforms.push(`h_${height}`);
  if (width || height) transforms.push(`c_${crop}`);

  return url.replace("/upload/", `/upload/${transforms.join(",")}/`);
}
