import Link from "next/link";
import { StarRating } from "@/components/store/star-rating";
import { ReviewForm } from "@/components/store/review-form";
import type { RatingSummary, ReviewEligibility } from "@/lib/queries/reviews";

interface ReviewItem {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
  user: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

interface ReviewListProps {
  productId: string;
  reviews: ReviewItem[];
  summary: RatingSummary;
  eligibility: ReviewEligibility;
  currentUserId?: string;
}

function formatDate(d: Date): string {
  return new Date(d).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function ReviewList({
  productId,
  reviews,
  summary,
  eligibility,
  currentUserId,
}: ReviewListProps) {
  const maxBar = Math.max(1, ...Object.values(summary.distribution));

  return (
    <div className="space-y-5">
      <h2 className="font-display text-2xl font-light italic">
        Customer Reviews
      </h2>

      {/* Summary */}
      {summary.count > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-6 p-5 bg-cream-dark rounded">
          <div className="text-center md:text-left">
            <div className="font-display text-4xl font-light text-copper mb-1">
              {summary.average.toFixed(1)}
            </div>
            <StarRating value={summary.average} size={16} />
            <div className="text-xs text-charcoal-soft mt-1">
              {summary.count} review{summary.count === 1 ? "" : "s"}
            </div>
          </div>
          <div className="space-y-1.5">
            {([5, 4, 3, 2, 1] as const).map((star) => {
              const count = summary.distribution[star];
              const pct = (count / maxBar) * 100;
              return (
                <div
                  key={star}
                  className="flex items-center gap-2 text-xs text-charcoal-soft"
                >
                  <span className="w-3 text-right">{star}</span>
                  <span className="text-copper">★</span>
                  <div className="flex-1 h-2 bg-white rounded overflow-hidden">
                    <div
                      className="h-full bg-copper/70"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-6 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <p className="text-sm text-charcoal-soft">
          No reviews yet — be the first to share your thoughts.
        </p>
      )}

      {/* Submission form / eligibility message */}
      {!eligibility.signedIn ? (
        <div className="p-4 bg-cream-dark rounded text-sm text-charcoal-soft">
          <Link href="/auth/signin" className="text-copper underline">
            Sign in
          </Link>{" "}
          to leave a review.
        </div>
      ) : eligibility.hasPurchased ? (
        <ReviewForm
          productId={productId}
          existingReview={eligibility.existingReview}
        />
      ) : (
        <div className="p-4 bg-cream-dark rounded text-sm text-charcoal-soft">
          Reviews are open to buyers — you can post one once your order is marked delivered.
        </div>
      )}

      {/* Review list */}
      {reviews.length > 0 && (
        <div className="space-y-3">
          {reviews.map((review) => {
            const isMine = currentUserId === review.user.id;
            return (
              <div
                key={review.id}
                className="p-4 bg-cream-dark rounded text-sm"
              >
                <div className="flex justify-between items-start mb-1.5">
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      {review.user.firstName}{" "}
                      {review.user.lastName ? `${review.user.lastName[0]}.` : ""}
                      {isMine && (
                        <span className="text-xs px-1.5 py-0.5 bg-copper/10 text-copper rounded">
                          You
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-charcoal-soft">
                      {formatDate(review.createdAt)}
                    </div>
                  </div>
                  <StarRating value={review.rating} size={13} />
                </div>
                {review.comment && (
                  <p className="text-charcoal-soft mt-1">{review.comment}</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
