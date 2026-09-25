"use client";

import { useEffect, useState } from "react";
import { ReviewForm } from "@/components/reviews/ReviewForm";
import { StarRating } from "@/components/reviews/StarRating";
import type { BookingReviewsDto, ReviewDto } from "@/types/review";

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
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const apiBase =
    actor === "client" ? "/api/client/bookings" : "/api/pilot/bookings";

  useEffect(() => {
    fetch(`${apiBase}/${bookingId}/reviews`)
      .then((res) => res.json())
      .then((json) => setData(json.error ? null : json))
      .finally(() => setLoading(false));
  }, [apiBase, bookingId]);

  function handleReviewSuccess(review: ReviewDto) {
    setSuccessMessage("Review submitted successfully.");
    setData((current) =>
      current
        ? {
            ...current,
            myReview: review,
            canReview: false,
            reviews: [
              review,
              ...current.reviews.filter((row) => row.id !== review.id),
            ],
          }
        : current,
    );
  }

  if (loading) {
    return <p className="ras-help">Loading reviews…</p>;
  }

  if (!data) return null;

  const othersReviews = data.reviews.filter(
    (r) => r.id !== data.myReview?.id,
  );

  return (
    <div className="ras-panel space-y-6">
      <h3 className="ras-panel-title">Reviews</h3>

      {successMessage ? (
        <p className="ras-alert" role="status">
          {successMessage}
        </p>
      ) : null}

      {data.myReview ? (
        <div className="ras-panel ras-panel--nested">
          <p className="ras-panel-title">Your review</p>
          <div className="mt-2 flex items-center gap-2">
            <StarRating value={data.myReview.rating} size="md" />
            <span className="ras-muted text-sm">
              {new Date(data.myReview.createdAt).toLocaleDateString()}
            </span>
          </div>
          {data.myReview.comment ? (
            <p className="mt-2 whitespace-pre-wrap text-sm">{data.myReview.comment}</p>
          ) : null}
        </div>
      ) : data.canReview ? (
        <ReviewForm
          bookingId={bookingId}
          targetLabel={data.targetLabel}
          apiBase={apiBase}
          onSuccess={handleReviewSuccess}
        />
      ) : (
        <p className="ras-help">
          Reviews are available after the booking is marked completed.
        </p>
      )}

      {othersReviews.length > 0 ? (
        <div className="space-y-3 border-t border-[var(--color-border-divider)] pt-4">
          <p className="ras-panel-title">
            {actor === "client" ? "Pilot's review" : "Client's review"}
          </p>
          {othersReviews.map((review) => (
            <div key={review.id} className="text-sm">
              <StarRating value={review.rating} />
              {review.comment ? (
                <p className="mt-1 whitespace-pre-wrap">{review.comment}</p>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
