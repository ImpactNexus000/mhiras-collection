"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MAX_BULK_IMAGES, MAX_IMAGES_PER_PRODUCT } from "@/lib/bulk-upload";
import {
  checkFile,
  uploadFileWithProgress,
  type UploadedAsset,
} from "@/lib/upload-file";

export type StagedStatus = "pending" | "uploading" | "done" | "error";

export interface StagedImage {
  id: string;
  file: File;
  /** Object URL — instant local preview, no round trip to Cloudinary. */
  previewUrl: string;
  status: StagedStatus;
  progress: number;
  error?: string;
  /** Set once the upload lands; this is what gets saved on the product. */
  asset?: UploadedAsset;
  /**
   * Photos sharing a groupId become one product. A photo starts in a group of
   * its own, so the default really is "one photo, one garment"; grouping is
   * what the admin does for a second angle of the same piece.
   */
  groupId: string;
}

/**
 * Parallel uploads. Three keeps a slow connection saturated without starving
 * any single file — Cloudinary is happy with far more, the admin's uplink
 * usually isn't.
 */
const CONCURRENCY = 3;

/** Repaint the bar in 5% steps; every progress event would thrash 60 tiles. */
const PROGRESS_STEP = 5;

let uid = 0;
const nextId = () => `staged-${++uid}`;

/** Same photo dropped twice — name, size and mtime together are good enough. */
const fingerprint = (file: File) =>
  `${file.name}:${file.size}:${file.lastModified}`;

export interface AddResult {
  added: number;
  /** Human-readable reasons, one per rejected file. */
  rejected: string[];
}

/**
 * Owns the staged photos and the upload queue: files go in, Cloudinary assets
 * come out. Deliberately UI-free so the bulk screen can rearrange the photos
 * into product rows without touching any of this.
 */
export function useImageStaging() {
  const [images, setImages] = useState<StagedImage[]>([]);
  const controllers = useRef(new Map<string, AbortController>());
  const inFlight = useRef(new Set<string>());
  const imagesRef = useRef<StagedImage[]>([]);

  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  // Abort in-flight uploads and release every object URL when the screen goes.
  useEffect(() => {
    const running = controllers.current;
    return () => {
      running.forEach((controller) => controller.abort());
      imagesRef.current.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    };
  }, []);

  const update = useCallback((id: string, patch: Partial<StagedImage>) => {
    setImages((list) =>
      list.map((img) => (img.id === id ? { ...img, ...patch } : img))
    );
  }, []);

  const start = useCallback(
    async (image: StagedImage) => {
      inFlight.current.add(image.id);
      const controller = new AbortController();
      controllers.current.set(image.id, controller);
      update(image.id, { status: "uploading", progress: 0, error: undefined });

      try {
        const asset = await uploadFileWithProgress(
          image.file,
          (percent) =>
            setImages((list) =>
              list.map((img) =>
                img.id === image.id &&
                (percent === 100 || percent - img.progress >= PROGRESS_STEP)
                  ? { ...img, progress: percent }
                  : img
              )
            ),
          controller.signal
        );
        update(image.id, { status: "done", progress: 100, asset });
      } catch (error) {
        // Aborted means the admin removed the tile — it's already gone.
        if (error instanceof DOMException && error.name === "AbortError") return;
        update(image.id, {
          status: "error",
          error: error instanceof Error ? error.message : "Upload failed.",
        });
      } finally {
        inFlight.current.delete(image.id);
        controllers.current.delete(image.id);
      }
    },
    [update]
  );

  // Keep CONCURRENCY uploads running. Every status change re-runs this, so
  // finishing one file immediately pulls the next off the queue.
  useEffect(() => {
    const slots = CONCURRENCY - inFlight.current.size;
    if (slots <= 0) return;

    images
      .filter((img) => img.status === "pending" && !inFlight.current.has(img.id))
      .slice(0, slots)
      .forEach((img) => void start(img));
  }, [images, start]);

  const add = useCallback(
    (files: File[]): AddResult => {
      const room = MAX_BULK_IMAGES - images.length;
      const seen = new Set(images.map((img) => fingerprint(img.file)));
      const rejected: string[] = [];
      const accepted: StagedImage[] = [];

      for (const file of files) {
        if (accepted.length >= room) {
          rejected.push(
            `${file.name} — batch is full (${MAX_BULK_IMAGES} photos max).`
          );
          continue;
        }

        const print = fingerprint(file);
        if (seen.has(print)) {
          rejected.push(`${file.name} — already added.`);
          continue;
        }

        const problem = checkFile(file);
        if (problem) {
          rejected.push(`${file.name} — ${problem}`);
          continue;
        }

        seen.add(print);
        const id = nextId();
        accepted.push({
          id,
          groupId: id,
          file,
          previewUrl: URL.createObjectURL(file),
          status: "pending",
          progress: 0,
        });
      }

      if (accepted.length > 0) setImages((list) => [...list, ...accepted]);
      return { added: accepted.length, rejected };
    },
    [images]
  );

  const remove = useCallback((id: string) => {
    controllers.current.get(id)?.abort();
    setImages((list) => {
      const target = list.find((img) => img.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return list.filter((img) => img.id !== id);
    });
  }, []);

  const retry = useCallback((id: string) => {
    setImages((list) =>
      list.map((img) =>
        img.id === id && img.status === "error"
          ? { ...img, status: "pending", progress: 0, error: undefined }
          : img
      )
    );
  }, []);

  const retryFailed = useCallback(() => {
    setImages((list) =>
      list.map((img) =>
        img.status === "error"
          ? { ...img, status: "pending", progress: 0, error: undefined }
          : img
      )
    );
  }, []);

  const clear = useCallback(() => {
    controllers.current.forEach((controller) => controller.abort());
    setImages((list) => {
      list.forEach((img) => URL.revokeObjectURL(img.previewUrl));
      return [];
    });
  }, []);

  /**
   * Merge the given groups into one product. The earliest group in file order
   * wins the id, so a grouped product keeps its place in the list.
   */
  const group = useCallback(
    (groupIds: string[]): { ok: boolean; message?: string } => {
      const targets = new Set(groupIds);
      const members = images.filter((img) => targets.has(img.groupId));

      if (targets.size < 2) {
        return { ok: false, message: "Pick at least two products to group." };
      }
      if (members.length > MAX_IMAGES_PER_PRODUCT) {
        return {
          ok: false,
          message: `One product can hold ${MAX_IMAGES_PER_PRODUCT} photos — that's ${members.length}.`,
        };
      }

      const anchor = members[0].groupId;
      setImages((list) =>
        list.map((img) =>
          targets.has(img.groupId) ? { ...img, groupId: anchor } : img
        )
      );
      return { ok: true };
    },
    [images]
  );

  /** Split a product back into one product per photo. */
  const ungroup = useCallback((groupId: string) => {
    setImages((list) =>
      list.map((img) =>
        img.groupId === groupId ? { ...img, groupId: img.id } : img
      )
    );
  }, []);

  /**
   * Regroup everything in file order, `size` photos per product — the shortcut
   * for a shoot with a consistent number of angles per garment. `size` of 1
   * puts every photo back on its own.
   */
  const groupEvery = useCallback((size: number) => {
    setImages((list) =>
      list.map((img, i) => ({
        ...img,
        groupId: list[Math.floor(i / size) * size].id,
      }))
    );
  }, []);

  /** Make a photo the primary one for its product by moving it to the front. */
  const promote = useCallback((imageId: string) => {
    setImages((list) => {
      const current = list.findIndex((img) => img.id === imageId);
      if (current < 0) return list;
      const first = list.findIndex(
        (img) => img.groupId === list[current].groupId
      );
      if (first === current) return list;

      const copy = [...list];
      const [moved] = copy.splice(current, 1);
      copy.splice(first, 0, moved);
      return copy;
    });
  }, []);

  /**
   * The photos collapsed into one entry per product, in file order. A Map
   * keeps insertion order, so a grouped product sits where its first photo was.
   */
  const rows = useMemo(() => {
    const byGroup = new Map<string, StagedImage[]>();
    for (const image of images) {
      const existing = byGroup.get(image.groupId);
      if (existing) existing.push(image);
      else byGroup.set(image.groupId, [image]);
    }
    return [...byGroup.entries()].map(([groupId, groupImages]) => ({
      groupId,
      images: groupImages,
    }));
  }, [images]);

  const counts = useMemo(() => {
    const done = images.filter((img) => img.status === "done").length;
    const failed = images.filter((img) => img.status === "error").length;
    return {
      total: images.length,
      done,
      failed,
      busy: images.length - done - failed,
      products: rows.length,
    };
  }, [images, rows]);

  return {
    images,
    rows,
    counts,
    add,
    remove,
    retry,
    retryFailed,
    clear,
    group,
    ungroup,
    groupEvery,
    promote,
  };
}

export type BulkRow = ReturnType<typeof useImageStaging>["rows"][number];
