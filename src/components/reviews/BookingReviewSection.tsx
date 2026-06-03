"use client";

import { useEffect, useState } from "react";
import { ReviewForm } from "@/components/reviews/ReviewForm";
import { StarRating } from "@/components/reviews/StarRating";
import type { BookingReviewsDto } from "@/types/review";

type BookingReviewSectionProps = {
  bookingId: string;
  actor: "client" | "pilot";
};

export function BookingReviewSection({
  bookingId,
  actor,
}: BookingReviewSectionProps) {
  const [data, setData] = useState<BookingReviewsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const apiBase =
    actor === "client" ? "/api/client/bookings" : "/api/pilot/bookings";

  useEffect(() => {
    fetch(`${apiBase}/${bookingId}/reviews`)
      .then((res) => res.json())
      .then((json) => setData(json.error ? null : json))
      .finally(() => setLoading(false));
  }, [apiBase, bookingId]);

  if (loading) {
    return (
      <p className="text-sm text-muted-foreground">Loading reviews…</p>
    );
  }

  if (!data) return null;

  const othersReviews = data.reviews.filter(
    (r) => r.id !== data.myReview?.id,
  );

  return (
    <div className="rounded-lg border border-border p-6 space-y-6">
      <h3 className="font-medium">Reviews</h3>

      {data.myReview ? (
        <div className="rounded-md border border-gold/30 bg-gold/10 p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-gold-dark">
            Your review
          </p>
          <div className="mt-2 flex items-center gap-2">
            <StarRating value={data.myReview.rating} size="md" />
            <span className="text-sm text-muted-foreground">
              {new Date(data.myReview.createdAt).toLocaleDateString()}
            </span>
          </div>
          {data.myReview.comment ? (
            <p className="mt-2 text-sm whitespace-pre-wrap">{data.myReview.comment}</p>
          ) : null}
        </div>
      ) : data.canReview ? (
        <ReviewForm
          bookingId={bookingId}
          targetLabel={data.targetLabel}
          apiBase={apiBase}
        />
      ) : (
        <p className="text-sm text-muted-foreground">
          Reviews are available after the booking is marked completed.
        </p>
      )}

      {othersReviews.length > 0 ? (
        <div className="space-y-3 border-t border-border pt-4">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {actor === "client" ? "Pilot's review" : "Client's review"}
          </p>
          {othersReviews.map((review) => (
            <div key={review.id} className="text-sm">
              <StarRating value={review.rating} />
              {review.comment ? (
                <p className="mt-2 whitespace-pre-wrap text-muted-foreground">
                  {review.comment}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
