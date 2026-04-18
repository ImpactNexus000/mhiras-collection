import { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { getMyReviews } from "@/lib/queries/reviews";
import { MyReviewRow } from "@/components/store/my-review-row";
import { Button } from "@/components/ui/button";
import { Star, ChevronLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "My Reviews",
};

export default async function MyReviewsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin");

  const reviews = await getMyReviews();

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 md:py-12">
      <Link
        href="/account"
        className="inline-flex items-center gap-1 text-sm text-charcoal-soft hover:text-copper mb-4"
      >
        <ChevronLeft size={16} />
        Back to account
      </Link>

      <h1 className="font-display text-3xl md:text-4xl font-light italic mb-2">
        My Reviews
      </h1>
      <p className="text-sm text-charcoal-soft mb-6">
        {reviews.length === 0
          ? "You haven't written any reviews yet."
          : `${reviews.length} review${reviews.length === 1 ? "" : "s"}`}
      </p>

      {reviews.length === 0 ? (
        <div className="border border-border rounded-lg p-10 text-center">
          <Star
            size={28}
            className="mx-auto mb-3 text-charcoal-soft opacity-60"
          />
          <p className="text-charcoal-soft mb-4">
            Reviews you leave on delivered orders will show up here.
          </p>
          <Link href="/account/orders">
            <Button size="sm">View my orders</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <MyReviewRow key={review.id} review={review} />
          ))}
        </div>
      )}
    </div>
  );
}
