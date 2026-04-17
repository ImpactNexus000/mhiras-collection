"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { updateReview, deleteReview } from "@/app/actions/reviews";
import { StarRating, StarRatingInput } from "@/components/store/star-rating";
import { Button } from "@/components/ui/button";
import { getOptimizedUrl } from "@/lib/cloudinary";

const MAX_COMMENT = 1000;

interface MyReviewRowProps {
  review: {
    id: string;
    rating: number;
    comment: string | null;
    createdAt: Date;
    product: {
      id: string;
      name: string;
      slug: string;
      images: { url: string }[];
    };
  };
}

function formatDate(d: Date): string {
  return new Date(d).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function MyReviewRow({ review }: MyReviewRowProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [rating, setRating] = useState(review.rating);
  const [comment, setComment] = useState(review.comment ?? "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const image = review.product.images[0]?.url ?? null;

  function startEdit() {
    setRating(review.rating);
    setComment(review.comment ?? "");
    setError("");
    setEditing(true);
  }

  function cancelEdit() {
    setEditing(false);
    setError("");
  }

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    if (rating < 1) {
      setError("Pick a star rating first.");
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.set("rating", String(rating));
    formData.set("comment", comment);
    const result = await updateReview(review.id, formData);
    if ("error" in result && result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }
    setEditing(false);
    router.refresh();
    setLoading(false);
  }

  async function handleDelete() {
    if (!confirm("Remove your review?")) return;
    setLoading(true);
    const result = await deleteReview(review.id);
    if ("error" in result && result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }
    router.refresh();
  }

  return (
    <div className="border border-border rounded-lg p-4 bg-white">
      <div className="flex gap-4">
        {/* Thumbnail */}
        <Link
          href={`/shop/${review.product.slug}`}
          className="block flex-shrink-0"
        >
          {image ? (
            <img
              src={getOptimizedUrl(image, { width: 100, height: 120 })}
              alt={review.product.name}
              className="w-20 h-24 object-cover rounded bg-cream-dark"
              loading="lazy"
            />
          ) : (
            <div className="w-20 h-24 bg-cream-dark rounded" />
          )}
        </Link>

        {/* Body */}
        <div className="flex-1 min-w-0">
          <Link
            href={`/shop/${review.product.slug}`}
            className="font-medium text-base hover:text-copper line-clamp-2"
          >
            {review.product.name}
          </Link>

          {!editing ? (
            <>
              <div className="flex items-center gap-2 mt-1.5">
                <StarRating value={review.rating} size={14} />
                <span className="text-xs text-charcoal-soft">
                  {formatDate(review.createdAt)}
                </span>
              </div>
              {review.comment && (
                <p className="text-sm text-charcoal-soft mt-2">
                  {review.comment}
                </p>
              )}
              <div className="flex gap-2 mt-3 items-center">
                <button
                  type="button"
                  onClick={startEdit}
                  disabled={loading}
                  className="text-xs text-copper hover:text-copper-dark cursor-pointer disabled:opacity-50"
                >
                  Edit
                </button>
                <span className="text-border">|</span>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={loading}
                  className="text-xs text-charcoal-soft hover:text-danger cursor-pointer disabled:opacity-50"
                >
                  Delete
                </button>
                {error && (
                  <span className="text-xs text-danger ml-2">{error}</span>
                )}
              </div>
            </>
          ) : (
            <form onSubmit={handleSave} className="mt-2 space-y-2">
              <StarRatingInput
                value={rating}
                onChange={setRating}
                size={20}
                disabled={loading}
              />
              <textarea
                value={comment}
                onChange={(e) =>
                  setComment(e.target.value.slice(0, MAX_COMMENT))
                }
                rows={3}
                disabled={loading}
                className="w-full border border-border px-3 py-2 text-sm rounded outline-none focus:border-copper resize-none"
                placeholder="Share a few words (optional)"
              />
              <div className="text-xs text-charcoal-soft text-right">
                {comment.length}/{MAX_COMMENT}
              </div>
              {error && (
                <div className="text-sm text-danger bg-danger/10 px-3 py-2 rounded">
                  {error}
                </div>
              )}
              <div className="flex gap-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={cancelEdit}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
