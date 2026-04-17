"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, X, GripVertical, Star } from "lucide-react";

export interface UploadedImage {
  url: string;
  publicId: string;
  isPrimary: boolean;
}

interface ImageUploadProps {
  images: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
  maxImages?: number;
}

export function ImageUpload({
  images,
  onChange,
  maxImages = 6,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      const remaining = maxImages - images.length;

      if (remaining <= 0) {
        setError(`Maximum ${maxImages} images allowed.`);
        return;
      }

      const toUpload = fileArray.slice(0, remaining);
      setError("");
      setUploading(true);

      const newImages: UploadedImage[] = [];

      for (const file of toUpload) {
        const formData = new FormData();
        formData.append("file", file);

        try {
          const res = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });

          const data = await res.json();

          if (!res.ok) {
            setError(data.error || "Upload failed");
            continue;
          }

          newImages.push({
            url: data.url,
            publicId: data.publicId,
            isPrimary: images.length === 0 && newImages.length === 0,
          });
        } catch {
          setError("Upload failed. Please try again.");
        }
      }

      if (newImages.length > 0) {
        onChange([...images, ...newImages]);
      }

      setUploading(false);
    },
    [images, maxImages, onChange]
  );

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      uploadFiles(e.dataTransfer.files);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      uploadFiles(e.target.files);
      e.target.value = "";
    }
  }

  function removeImage(index: number) {
    const updated = images.filter((_, i) => i !== index);
    // If we removed the primary, make the first one primary
    if (updated.length > 0 && !updated.some((img) => img.isPrimary)) {
      updated[0].isPrimary = true;
    }
    onChange(updated);
  }

  function setPrimary(index: number) {
    const updated = images.map((img, i) => ({
      ...img,
      isPrimary: i === index,
    }));
    onChange(updated);
  }

  function moveImage(from: number, to: number) {
    if (to < 0 || to >= images.length) return;
    const updated = [...images];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);
    onChange(updated);
  }

  return (
    <div>
      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          dragOver
            ? "border-copper bg-copper-light/30"
            : "border-border hover:border-charcoal-soft"
        } ${uploading ? "opacity-60 pointer-events-none" : ""}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />
        <Upload
          size={24}
          className="mx-auto mb-2 text-charcoal-soft"
        />
        <p className="text-sm text-charcoal-soft">
          {uploading
            ? "Uploading..."
            : "Drop images here or click to browse"}
        </p>
        <p className="text-xs text-charcoal-soft/60 mt-1">
          JPG, PNG, or WebP — max 5MB each — up to {maxImages} images
        </p>
      </div>

      {error && (
        <p className="text-xs text-danger mt-2">{error}</p>
      )}

      {/* Image previews */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mt-3">
          {images.map((img, i) => (
            <div
              key={img.publicId}
              className={`relative group rounded overflow-hidden border-2 ${
                img.isPrimary ? "border-copper" : "border-border"
              }`}
            >
              <img
                src={img.url}
                alt={`Product image ${i + 1}`}
                className="w-full aspect-square object-cover"
              />

              {/* Primary badge */}
              {img.isPrimary && (
                <div className="absolute top-1 left-1 bg-copper text-white text-[10px] px-1.5 py-0.5 rounded font-medium">
                  Primary
                </div>
              )}

              {/* Hover actions */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                {!img.isPrimary && (
                  <button
                    type="button"
                    onClick={() => setPrimary(i)}
                    className="w-7 h-7 rounded-full bg-white flex items-center justify-center hover:bg-copper hover:text-white transition-colors cursor-pointer"
                    title="Set as primary"
                  >
                    <Star size={13} />
                  </button>
                )}
                {i > 0 && (
                  <button
                    type="button"
                    onClick={() => moveImage(i, i - 1)}
                    className="w-7 h-7 rounded-full bg-white flex items-center justify-center hover:bg-charcoal hover:text-white transition-colors cursor-pointer"
                    title="Move left"
                  >
                    <GripVertical size={13} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="w-7 h-7 rounded-full bg-white flex items-center justify-center hover:bg-danger hover:text-white transition-colors cursor-pointer"
                  title="Remove"
                >
                  <X size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
