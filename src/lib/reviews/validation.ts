export type ReviewInput = {
  rating?: number | string;
  comment?: string | null;
};

export type ValidationResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export function validateReviewInput(
  input: ReviewInput,
): ValidationResult<{ rating: number; comment: string | null }> {
  const rating =
    typeof input.rating === "string" ? Number(input.rating) : input.rating;

  if (
    rating == null ||
    Number.isNaN(rating) ||
    !Number.isInteger(rating) ||
    rating < 1 ||
    rating > 5
  ) {
    return { ok: false, error: "Rating must be a whole number from 1 to 5." };
  }

  const comment = input.comment?.trim() || null;
  if (comment && comment.length < 10) {
    return {
      ok: false,
      error: "Comment must be at least 10 characters if provided.",
    };
  }

  return { ok: true, data: { rating, comment } };
}
