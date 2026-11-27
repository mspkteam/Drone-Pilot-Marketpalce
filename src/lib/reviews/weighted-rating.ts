/** Recent jobs count more: weight halves every HALF_LIFE_DAYS. */
export const REVIEW_WEIGHT_HALF_LIFE_DAYS = 365;

/** Floor so very old reviews still count a little (never zero). */
export const REVIEW_WEIGHT_MIN = 0.1;

export type WeightedReviewInput = {
  rating: number;
  createdAt: Date | string;
};

export function reviewRecencyWeight(
  createdAt: Date | string,
  now: Date = new Date(),
  halfLifeDays: number = REVIEW_WEIGHT_HALF_LIFE_DAYS,
): number {
  const created = typeof createdAt === "string" ? new Date(createdAt) : createdAt;
  const ageMs = now.getTime() - created.getTime();
  if (!Number.isFinite(ageMs) || ageMs <= 0) return 1;
  const ageDays = ageMs / 86_400_000;
  const weight = Math.pow(0.5, ageDays / halfLifeDays);
  return Math.max(REVIEW_WEIGHT_MIN, weight);
}

/**
 * Exponential-decay weighted mean, rounded to 1 decimal.
 * Returns null when there are no reviews.
 */
export function weightedAverageRating(
  reviews: WeightedReviewInput[],
  options?: { now?: Date; halfLifeDays?: number },
): number | null {
  if (reviews.length === 0) return null;
  const now = options?.now ?? new Date();
  let weightedSum = 0;
  let totalWeight = 0;
  for (const r of reviews) {
    const w = reviewRecencyWeight(r.createdAt, now, options?.halfLifeDays);
    weightedSum += r.rating * w;
    totalWeight += w;
  }
  if (totalWeight === 0) return null;
  return Math.round((weightedSum / totalWeight) * 10) / 10;
}
