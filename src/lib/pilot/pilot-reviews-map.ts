import { formatDisplayDate } from "@/lib/format/date";
import { PILOT_MOCK_REVIEWS } from "@/lib/pilot/dashboard-overview-mock";
import type { ReviewListItemDto } from "@/types/review";

import { weightedAverageRating } from "@/lib/reviews/weighted-rating";

export type PilotReviewRow = {
  id: string;
  /** ISO timestamp — used for recency-weighted average. */
  createdAt: string;
  title: string;
  date: string;
  rating: number;
  text: string;
};

export type PilotReviewsSummary = {
  averageRating: number;
  count: number;
  fillPct: number;
};

function formatReviewDate(iso: string): string {
  return formatDisplayDate(iso);
}

export function mapReviewToPilotRow(review: ReviewListItemDto): PilotReviewRow {
  const title =
    review.direction === "received"
      ? review.authorLabel
      : review.targetLabel;

  return {
    id: review.id,
    createdAt: review.createdAt,
    title,
    date: formatReviewDate(review.createdAt),
    rating: review.rating,
    text: (review.comment ?? review.booking.job.title).toUpperCase(),
  };
}

export function buildPilotReviewsMockRows(): PilotReviewRow[] {
  const template = PILOT_MOCK_REVIEWS[0]!;
  return Array.from({ length: 5 }, (_, index) => ({
    id: `mock-review-${index + 1}`,
    createdAt: new Date().toISOString(),
    title: template.title,
    date: template.date,
    rating: template.rating,
    text: template.text,
  }));
}

export function summarizePilotReviews(rows: PilotReviewRow[]): PilotReviewsSummary {
  if (rows.length === 0) {
    return {
      averageRating: 0,
      count: 0,
      fillPct: 0,
    };
  }

  const avg = weightedAverageRating(rows) ?? 0;
  return {
    averageRating: avg,
    count: rows.length,
    fillPct: Math.min(100, Math.round((avg / 5) * 100)),
  };
}

export function mapApiReviewsToPilotRows(
  reviews: ReviewListItemDto[],
): PilotReviewRow[] {
  return reviews
    .filter((review) => review.direction === "received")
    .map(mapReviewToPilotRow);
}
