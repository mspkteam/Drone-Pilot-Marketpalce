"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { StarRatingInput } from "@/components/reviews/StarRating";
import { FormField, inputClassName } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";

type ReviewFormProps = {
  bookingId: string;
  targetLabel: string;
  apiBase: "/api/client/bookings" | "/api/pilot/bookings";
};

export function ReviewForm({ bookingId, targetLabel, apiBase }: ReviewFormProps) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const resolvedPath = `${apiBase}/${bookingId}/reviews`;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch(resolvedPath, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating,
          comment: comment.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to submit review.");
        return;
      }
      router.refresh();
    } catch {
      setError("Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Rate your experience with <strong>{targetLabel}</strong>.
      </p>
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      <FormField label="Rating" htmlFor="rating" required>
        <StarRatingInput
          value={rating}
          onChange={setRating}
          disabled={submitting}
        />
      </FormField>
      {rating < 1 ? (
        <p className="text-xs text-muted-foreground">Select a star rating to continue.</p>
      ) : null}
      <FormField
        label="Comment"
        htmlFor="comment"
        hint="Optional — at least 10 characters if provided."
      >
        <textarea
          id="comment"
          name="comment"
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className={inputClassName}
          disabled={submitting}
          placeholder="Share how the mission went…"
        />
      </FormField>
      <Button type="submit" disabled={submitting || rating < 1}>
        {submitting ? "Submitting…" : "Submit review"}
      </Button>
    </form>
  );
}
