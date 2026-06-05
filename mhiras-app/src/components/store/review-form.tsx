"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createReview, deleteReview } from "@/app/actions/reviews";
import { StarRatingInput } from "@/components/store/star-rating";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

const MAX_COMMENT = 1000;

interface ReviewFormProps {
  productId: string;
  existingReview: {
    id: string;
    rating: number;
    comment: string | null;
  } | null;
}

export function ReviewForm({ productId, existingReview }: ReviewFormProps) {
  const router = useRouter();
  const { success, error: toastError } = useToast();
  const [rating, setRating] = useState(existingReview?.rating ?? 0);
  const [comment, setComment] = useState(existingReview?.comment ?? "");
  const [loading, setLoading] = useState(false);
  const isEditing = !!existingReview;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (rating < 1) {
      toastError("Pick a star rating first.");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.set("rating", String(rating));
    formData.set("comment", comment);

    const result = await createReview(productId, formData);

    if ("error" in result && result.error) {
      toastError(result.error);
      setLoading(false);
      return;
    }

    success(isEditing ? "Review updated." : "Review posted.");
    router.refresh();
    setLoading(false);
  }

  async function handleDelete() {
    if (!existingReview) return;
    if (!confirm("Remove your review?")) return;
    setLoading(true);
    const result = await deleteReview(existingReview.id);
    if ("error" in result && result.error) {
      toastError(result.error);
      setLoading(false);
      return;
    }
    setRating(0);
    setComment("");
    success("Review removed.");
    router.refresh();
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="p-5 bg-cream-dark rounded space-y-4">
      <div>
        <div className="text-xs uppercase tracking-wider text-charcoal-mid font-medium mb-2">
          {isEditing ? "Your review" : "Leave a review"}
        </div>
        <StarRatingInput
          value={rating}
          onChange={setRating}
          disabled={loading}
        />
      </div>

      <div>
        <textarea
          name="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value.slice(0, MAX_COMMENT))}
          rows={3}
          disabled={loading}
          className="w-full border border-border px-3 py-2.5 text-sm rounded outline-none focus:border-copper bg-white resize-none"
          placeholder="Share a few words about this piece (optional)"
        />
        <div className="text-xs text-charcoal-soft mt-1 text-right">
          {comment.length}/{MAX_COMMENT}
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="submit" variant="primary" size="sm" disabled={loading}>
          {loading
            ? "Saving..."
            : isEditing
              ? "Update review"
              : "Post review"}
        </Button>
        {isEditing && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleDelete}
            disabled={loading}
          >
            Delete
          </Button>
        )}
      </div>
    </form>
  );
}
