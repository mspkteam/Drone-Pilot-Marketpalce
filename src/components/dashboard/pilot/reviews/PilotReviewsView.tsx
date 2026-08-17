"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { PilotReviewsStars } from "./PilotReviewsStars";
import {
  mapApiReviewsToPilotRows,
  summarizePilotReviews,
  type PilotReviewRow,
} from "@/lib/pilot/pilot-reviews-map";
import type { ReviewListItemDto } from "@/types/review";

const REVIEWS_API = "/api/pilot/reviews" as const;

export function PilotReviewsView() {
  const [reviews, setReviews] = useState<ReviewListItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(REVIEWS_API)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "Failed to load reviews.");
          setReviews([]);
        } else {
          setReviews(data.reviews ?? []);
        }
      })
      .catch(() => {
        setError("Failed to load reviews.");
        setReviews([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const { rows, summary } = useMemo(() => {
    const live = mapApiReviewsToPilotRows(reviews);
    return {
      rows: live,
      summary: summarizePilotReviews(live),
    };
  }, [reviews]);

  return (
    <div className="pilot-reviews-page">
      <header className="pilot-reviews-header pilot-reviews-bracket-card">
        <p className="pilot-reviews-eyebrow">PILOT / REVIEWS</p>
        <h1 className="pilot-reviews-title-main">Reviews</h1>
      </header>

      <section className="pilot-reviews-panel" aria-label="Reviews">
        <h2 className="pilot-reviews-panel-title">Reviews</h2>

        {error ? (
          <p className="pilot-reviews-banner pilot-reviews-banner--error" role="alert">
            {error}
          </p>
        ) : null}

        {loading ? (
          <p className="pilot-reviews-loading">Loading reviews…</p>
        ) : (
          <>
            <div className="pilot-reviews-summary">
              <p className="pilot-reviews-rating-value">
                {summary.averageRating}/5
              </p>
              <PilotReviewsStars value={Math.round(summary.averageRating)} />
              <div className="pilot-reviews-rating-bar" aria-hidden>
                <div
                  className="pilot-reviews-rating-bar-fill"
                  style={{ width: `${summary.fillPct}%` }}
                />
              </div>
              <p className="pilot-reviews-rating-meta">
                BASED ON {summary.count} REVIEWS
              </p>
            </div>

            {rows.length === 0 ? (
              <p className="pilot-reviews-empty">
                No published reviews yet. Complete bookings and client ratings will appear
                here.
              </p>
            ) : (
              <div className="pilot-reviews-list">
                {rows.map((row) => (
                  <PilotReviewRowCard key={row.id} row={row} />
                ))}
              </div>
            )}
          </>
        )}
      </section>

      <div className="pilot-reviews-actions">
        <Link href="/dashboard/pilot/contracts" className="pilot-reviews-btn-gold">
          Review Dispute
        </Link>
        <Link
          href="/dashboard/pilot/support"
          className="pilot-reviews-btn-outline"
          title="Contact ground control to request a review reset"
        >
          Review Reset
        </Link>
      </div>
    </div>
  );
}

function PilotReviewRowCard({ row }: { row: PilotReviewRow }) {
  return (
    <article className="pilot-reviews-row">
      <div className="pilot-reviews-row-top">
        <h3 className="pilot-reviews-row-title">{row.title}</h3>
        <span className="pilot-reviews-row-date">{row.date}</span>
        <PilotReviewsStars value={row.rating} className="pilot-reviews-row-stars" />
      </div>
      <p className="pilot-reviews-row-text">{row.text}</p>
    </article>
  );
}
