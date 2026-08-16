/**
 * Browser-side upload helper for `/api/upload`, shared with the route so the
 * limits are stated once.
 *
 * Uses XMLHttpRequest rather than fetch: only XHR reports upload progress, and
 * a bulk drop of 60+ photos on a slow connection is unusable without a real
 * per-file progress bar.
 */

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
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

/** Reject files the API would reject anyway, before spending the bandwidth. */
export function checkFile(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return "Not a JPG, PNG, WebP or AVIF.";
  }
  if (file.size > MAX_FILE_SIZE) {
    return `Too large (${(file.size / 1024 / 1024).toFixed(1)}MB, max 5MB).`;
  }
  return null;
}

export function uploadFileWithProgress(
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
