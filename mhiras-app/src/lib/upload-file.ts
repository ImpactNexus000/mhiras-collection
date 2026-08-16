/**
 * Browser-side upload helper for `/api/upload`, shared with the route so the
 * limits are stated once.
 *
 * Uses XMLHttpRequest rather than fetch: only XHR reports upload progress, and
 * a bulk drop of 60+ photos on a slow connection is unusable without a real
 * per-file progress bar.
 */

/**
 * Biggest body we're willing to POST. Vercel rejects a serverless request body
 * over 4.5MB at the edge — before any route code runs, so the server can't
 * shrink an oversized photo itself. Anything above this gets resized in the
 * browser first; 4MB leaves room for multipart overhead.
 */
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

/** Biggest original we'll accept and try to shrink. */
export const MAX_SOURCE_BYTES = 30 * 1024 * 1024;

/**
 * Longest edge kept when resizing. Cloudinary serves per-breakpoint copies
 * anyway, so beyond this the extra pixels only cost upload time.
 */
const MAX_EDGE = 2400;

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
];

export interface UploadedAsset {
  url: string;
  publicId: string;
}

/** Reject what we can't do anything useful with, before spending bandwidth. */
export function checkFile(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return "Not a JPG, PNG, WebP or AVIF.";
  }
  if (file.size > MAX_SOURCE_BYTES) {
    return `Too large (${(file.size / 1024 / 1024).toFixed(1)}MB, max 30MB).`;
  }
  return null;
}

function withExtension(name: string, extension: string): string {
  return `${name.replace(/\.[^.]+$/, "")}.${extension}`;
}

/**
 * Shrink a photo that's too big to POST. Straight-from-the-phone shots are
 * routinely 4-8MB, and every one of them would otherwise die at Vercel's edge.
 *
 * Resizes to MAX_EDGE and re-encodes, dropping quality until it fits. WebP
 * first, JPEG as a fallback for browsers whose canvas won't encode WebP.
 * Photos already small enough are passed through untouched — no needless
 * re-encode of an image that was fine.
 */
export async function prepareImage(file: File): Promise<File> {
  if (file.size <= MAX_UPLOAD_BYTES) return file;

  let canvas: HTMLCanvasElement;
  try {
    // `from-image` applies the EXIF rotation; without it, portrait phone
    // photos come out on their side.
    const bitmap = await createImageBitmap(file, {
      imageOrientation: "from-image",
    });

    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);

    const context = canvas.getContext("2d");
    if (!context) throw new Error("no 2d context");
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
  } catch {
    // Undecodable or no canvas — send the original and let the size checks
    // report it rather than failing here with something cryptic.
    return file;
  }

  for (const type of ["image/webp", "image/jpeg"]) {
    for (const quality of [0.85, 0.7, 0.55]) {
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, type, quality)
      );
      // A null blob means this browser can't encode that type at all.
      if (!blob) break;
      if (blob.size <= MAX_UPLOAD_BYTES) {
        return new File(
          [blob],
          withExtension(file.name, type === "image/webp" ? "webp" : "jpg"),
          { type, lastModified: file.lastModified }
        );
      }
    }
  }

  throw new Error(
    "Couldn't get this photo under 4MB — resize it and try again."
  );
}

/** Resize if needed, then upload. */
export async function uploadFileWithProgress(
  file: File,
  onProgress: (percent: number) => void,
  signal?: AbortSignal
): Promise<UploadedAsset> {
  return postFile(await prepareImage(file), onProgress, signal);
}

function postFile(
  file: File,
  onProgress: (percent: number) => void,
  signal?: AbortSignal
): Promise<UploadedAsset> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException("Aborted", "AbortError"));
      return;
    }

    const xhr = new XMLHttpRequest();
    const body = new FormData();
    body.append("file", file);

    const onAbort = () => xhr.abort();
    signal?.addEventListener("abort", onAbort);

    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    });

    xhr.addEventListener("load", () => {
      signal?.removeEventListener("abort", onAbort);

      let payload: { url?: string; publicId?: string; error?: string } = {};
      try {
        payload = JSON.parse(xhr.responseText);
      } catch {
        // Non-JSON body — fall through to the status-based message below.
      }

      if (xhr.status >= 200 && xhr.status < 300 && payload.url && payload.publicId) {
        onProgress(100);
        resolve({ url: payload.url, publicId: payload.publicId });
        return;
      }

      if (payload.error) {
        reject(new Error(payload.error));
      } else if (xhr.status === 401) {
        reject(new Error("Your session expired — sign in again."));
      } else if (xhr.status === 413) {
        reject(new Error("Rejected as too large."));
      } else {
        reject(new Error(`Upload failed (${xhr.status || "no response"}).`));
      }
    });

    xhr.addEventListener("error", () => {
      signal?.removeEventListener("abort", onAbort);
      reject(new Error("Network error — check your connection."));
    });

    xhr.addEventListener("abort", () => {
      signal?.removeEventListener("abort", onAbort);
      reject(new DOMException("Aborted", "AbortError"));
    });

    xhr.open("POST", "/api/upload");
    xhr.send(body);
  });
}
