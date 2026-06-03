"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { StarRating } from "@/components/reviews/StarRating";
import type { ReviewListItemDto } from "@/types/review";

type ReviewsListProps = {
  apiPath: "/api/client/reviews" | "/api/pilot/reviews";
  bookingsBase: "/dashboard/client/bookings" | "/dashboard/pilot/bookings";
  emptyMessage: string;
};

export function ReviewsList({
  apiPath,
  bookingsBase,
  emptyMessage,
}: ReviewsListProps) {
  const [reviews, setReviews] = useState<ReviewListItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(apiPath)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setReviews(data.reviews ?? []);
        }
      })
      .catch(() => setError("Failed to load reviews."))
      .finally(() => setLoading(false));
  }, [apiPath]);

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading reviews…</p>;
  }

  if (error) {
    return (
      <p className="text-sm text-destructive" role="alert">
        {error}
      </p>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="empty-state">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <ul className="list-panel">
      {reviews.map((review) => (
        <li key={review.id} className="p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="font-medium">{review.booking.job.title}</p>
              <p className="text-sm text-muted-foreground">
                {review.direction === "given" ? "You reviewed" : "Review from"}{" "}
                <span className="text-foreground">{review.targetLabel}</span>
                {review.direction === "received" ? (
                  <>
                    {" "}
                    · by {review.authorLabel}
                  </>
                ) : null}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <StarRating value={review.rating} />
                <span className="text-xs text-muted-foreground">
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>
              {review.comment ? (
                <p className="mt-2 text-sm whitespace-pre-wrap text-muted-foreground">
                  {review.comment}
                </p>
              ) : null}
            </div>
            <Link
              href={`${bookingsBase}/${review.bookingId}`}
              className="text-sm text-gold-dark hover:text-gold shrink-0"
            >
              View booking →
            </Link>
          </div>
        </li>
      ))}
    </ul>
  );
}
