"use client";

import { useCallback, useEffect, useState } from "react";
import { formatDisplayDateShort } from "@/lib/format/date";
import type {
  AdminReviewListItem,
  ReviewResetRequestDto,
} from "@/lib/reviews/review-reset";

type ReviewFilter = "below5" | "all" | "hidden" | "published";

export function AdminReviewsModerationPanel() {
  const [resetRequests, setResetRequests] = useState<ReviewResetRequestDto[]>([]);
  const [reviews, setReviews] = useState<AdminReviewListItem[]>([]);
  const [filter, setFilter] = useState<ReviewFilter>("below5");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async (nextFilter: ReviewFilter) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ resetStatus: "pending" });
      if (nextFilter === "below5") params.set("belowFive", "1");
      if (nextFilter === "hidden") params.set("status", "hidden");
      if (nextFilter === "published") params.set("status", "published");

      const res = await fetch(`/api/admin/reviews?${params.toString()}`);
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
    void load(filter);
  }, [filter, load]);

  async function resolveRequest(id: string, decision: "approve" | "reject") {
    setBusyId(id);
    setError(null);
    setSuccess(null);
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
        setSuccess(
          decision === "approve"
            ? "Reset request approved. Non-5★ reviews were hidden."
            : "Reset request rejected.",
        );
        await load(filter);
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
    successMessage: string,
  ) {
    setBusyId(id);
    setError(null);
    setSuccess(null);
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
        setSuccess(successMessage);
        await load(filter);
      }
    } catch {
      setError("Failed to update review.");
    } finally {
      setBusyId(null);
    }
  }

  const filterLabel =
    filter === "below5"
      ? "Reviews below 5★"
      : filter === "hidden"
        ? "Hidden reviews"
        : filter === "published"
          ? "Published reviews"
          : "All reviews";

  return (
    <div className="admin-reviews-page">
      <header className="admin-reviews-header">
        <p className="admin-reviews-eyebrow">OPERATIONS / REVIEWS</p>
        <h1 className="admin-reviews-title">Review moderation</h1>
        <p className="admin-reviews-lead">
          Approve pilot review-reset requests and moderate ratings. Use Set 5★,
          Hide, or Publish — changes save immediately.
        </p>
      </header>

      {error ? (
        <p className="admin-reviews-error" role="alert">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="admin-reviews-success" role="status">
          {success}
        </p>
      ) : null}

      <section className="admin-reviews-panel">
        <h2 className="admin-reviews-panel-title">Pending reset requests</h2>
        {loading && resetRequests.length === 0 ? (
          <p className="admin-reviews-empty">Loading…</p>
        ) : resetRequests.length === 0 ? (
          <p className="admin-reviews-empty">No pending reset requests.</p>
        ) : (
          <ul className="admin-reviews-list">
            {resetRequests.map((req) => (
              <li key={req.id} className="admin-reviews-card">
                <div className="admin-reviews-card-body">
                  <p className="admin-reviews-card-title">{req.pilotDisplayName}</p>
                  <p className="admin-reviews-meta">
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
        <div className="admin-reviews-panel-head">
          <h2 className="admin-reviews-panel-title">{filterLabel}</h2>
          <div className="admin-reviews-filters" role="tablist" aria-label="Review filters">
            {(
              [
                ["below5", "Below 5★"],
                ["all", "All"],
                ["published", "Published"],
                ["hidden", "Hidden"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={filter === id}
                className={`admin-reviews-filter${filter === id ? " admin-reviews-filter--active" : ""}`}
                onClick={() => setFilter(id)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <p className="admin-reviews-empty">Loading…</p>
        ) : reviews.length === 0 ? (
          <p className="admin-reviews-empty">No reviews in this view.</p>
        ) : (
          <ul className="admin-reviews-list">
            {reviews.map((review) => (
              <li key={review.id} className="admin-reviews-card">
                <div className="admin-reviews-card-body">
                  <div className="admin-reviews-card-top">
                    <p className="admin-reviews-card-title">{review.targetLabel}</p>
                    <span className="admin-reviews-badge">
                      {review.rating}★ · {review.status}
                    </span>
                  </div>
                  <p className="admin-reviews-meta">
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
                      void patchReview(
                        review.id,
                        { rating: 5, status: "published" },
                        "Review set to 5★ and published.",
                      )
                    }
                  >
                    Set 5★
                  </button>
                  <button
                    type="button"
                    className="admin-reviews-btn-ghost"
                    disabled={busyId === review.id}
                    onClick={() =>
                      void patchReview(
                        review.id,
                        { status: "hidden" },
                        "Review hidden.",
                      )
                    }
                  >
                    Hide
                  </button>
                  <button
                    type="button"
                    className="admin-reviews-btn-ghost"
                    disabled={busyId === review.id}
                    onClick={() =>
                      void patchReview(
                        review.id,
                        { status: "published" },
                        "Review published.",
                      )
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
    </div>
  );
}
