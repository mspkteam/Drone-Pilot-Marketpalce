import { PILOT_MOCK_REVIEWS } from "@/lib/pilot/dashboard-overview-mock";
import type { ReviewListItemDto } from "@/types/review";

function averageRating(reviews: { rating: number }[]): number | null {
  if (reviews.length === 0) return null;
  const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
  return Math.round((sum / reviews.length) * 10) / 10;
}

export type PilotReviewRow = {
  id: string;
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
  const d = new Date(iso);
  return `${d
    .toLocaleString("en-US", { month: "short" })
    .toUpperCase()} ${d.getDate()} ${d.getFullYear()}`;
}

export function mapReviewToPilotRow(review: ReviewListItemDto): PilotReviewRow {
  const title =
    review.direction === "received"
      ? review.authorLabel
      : review.targetLabel;

  return {
    id: review.id,
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

  const avg = averageRating(rows) ?? 0;
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
