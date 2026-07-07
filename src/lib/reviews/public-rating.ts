/** Minimum published reviews before a pilot's numeric rating is shown publicly. */
export const MIN_REVIEWS_FOR_PUBLIC_RATING = 10;

export const PUBLIC_RATING_PENDING_LABEL = "Building Review History";

export function getPublicPilotRatingTag(
  reviewCount: number,
  averageRating: number | null,
): string {
  if (
    reviewCount >= MIN_REVIEWS_FOR_PUBLIC_RATING &&
    averageRating != null
  ) {
    return `${averageRating} Rating`;
  }
  return PUBLIC_RATING_PENDING_LABEL;
}
