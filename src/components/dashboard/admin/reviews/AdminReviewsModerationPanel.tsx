"use client";

import { useCallback, useEffect, useState } from "react";
import { formatDisplayDateShort } from "@/lib/format/date";
import type {
  AdminReviewListItem,
  ReviewResetRequestDto,
} from "@/lib/reviews/review-reset";

export function AdminReviewsModerationPanel() {
  const [resetRequests, setResetRequests] = useState<ReviewResetRequestDto[]>([]);
  const [reviews, setReviews] = useState<AdminReviewListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/reviews?resetStatus=pending&belowFive=1");
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to load reviews.");
        setResetRequests([]);
        setReviews([]);
      } else {
        setResetRequests(data.resetRequests ?? []);
        setReviews(data.reviews ?? []);
      }
    } catch {
      setError("Failed to load reviews.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function resolveRequest(id: string, decision: "approve" | "reject") {
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/reviews/reset-requests/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to resolve request.");
      } else {
        await load();
      }
    } catch {
      setError("Failed to resolve request.");
    } finally {
      setBusyId(null);
    }
  }

  async function patchReview(
    id: string,
    payload: { status?: "published" | "hidden" | "flagged"; rating?: number },
  ) {
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to update review.");
      } else {
        await load();
      }
    } catch {
      setError("Failed to update review.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="admin-reviews-page">
      <header className="admin-reviews-header">
        <p className="admin-reviews-eyebrow">OPERATIONS / REVIEWS</p>
        <h1 className="admin-reviews-title">Review moderation</h1>
        <p className="admin-reviews-lead">
          Approve pilot review-reset requests (hide non-5★ reviews) and adjust
          individual ratings for pilots or clients.
        </p>
      </header>

      {error ? (
        <p className="admin-reviews-error" role="alert">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="admin-reviews-muted">Loading…</p>
      ) : (
        <>
          <section className="admin-reviews-panel">
            <h2 className="admin-reviews-panel-title">Pending reset requests</h2>
            {resetRequests.length === 0 ? (
              <p className="admin-reviews-muted">No pending reset requests.</p>
            ) : (
              <ul className="admin-reviews-list">
                {resetRequests.map((req) => (
                  <li key={req.id} className="admin-reviews-card">
                    <div>
                      <p className="admin-reviews-card-title">{req.pilotDisplayName}</p>
                      <p className="admin-reviews-muted">
                        {req.nonFiveStarCount} review(s) below 5★ ·{" "}
                        {formatDisplayDateShort(req.createdAt)}
                      </p>
                      {req.note ? (
                        <p className="admin-reviews-note">{req.note}</p>
                      ) : null}
                    </div>
                    <div className="admin-reviews-actions">
                      <button
                        type="button"
                        className="admin-reviews-btn-gold"
                        disabled={busyId === req.id}
                        onClick={() => void resolveRequest(req.id, "approve")}
                      >
                        Approve (hide)
                      </button>
                      <button
                        type="button"
                        className="admin-reviews-btn-ghost"
                        disabled={busyId === req.id}
                        onClick={() => void resolveRequest(req.id, "reject")}
                      >
                        Reject
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="admin-reviews-panel">
            <h2 className="admin-reviews-panel-title">Reviews below 5★</h2>
            {reviews.length === 0 ? (
              <p className="admin-reviews-muted">No reviews below 5 stars.</p>
            ) : (
              <ul className="admin-reviews-list">
                {reviews.map((review) => (
                  <li key={review.id} className="admin-reviews-card">
                    <div>
                      <p className="admin-reviews-card-title">
                        {review.targetLabel} · {review.rating}★ · {review.status}
                      </p>
                      <p className="admin-reviews-muted">
                        By {review.authorEmail} ·{" "}
                        {formatDisplayDateShort(review.createdAt)}
                      </p>
                      {review.comment ? (
                        <p className="admin-reviews-note">{review.comment}</p>
                      ) : null}
                    </div>
                    <div className="admin-reviews-actions">
                      <button
                        type="button"
                        className="admin-reviews-btn-gold"
                        disabled={busyId === review.id}
                        onClick={() =>
                          void patchReview(review.id, { rating: 5, status: "published" })
                        }
                      >
                        Set 5★
                      </button>
                      <button
                        type="button"
                        className="admin-reviews-btn-ghost"
                        disabled={busyId === review.id}
                        onClick={() =>
                          void patchReview(review.id, { status: "hidden" })
                        }
                      >
                        Hide
                      </button>
                      <button
                        type="button"
                        className="admin-reviews-btn-ghost"
                        disabled={busyId === review.id}
                        onClick={() =>
                          void patchReview(review.id, { status: "published" })
                        }
                      >
                        Publish
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}
