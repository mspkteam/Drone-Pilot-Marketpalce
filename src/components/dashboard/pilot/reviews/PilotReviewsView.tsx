"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { PilotReviewsStars } from "./PilotReviewsStars";
import {
  mapApiReviewsToPilotRows,
  summarizePilotReviews,
  type PilotReviewRow,
} from "@/lib/pilot/pilot-reviews-map";
import type { ReviewListItemDto } from "@/types/review";

type ReconsiderationStatus = "pending" | "kept" | "updated";

const RECONSIDERATION_LABELS: Record<ReconsiderationStatus, string> = {
  pending: "Reconsideration requested",
  kept: "Client kept this review",
  updated: "Client updated this review",
};

const REVIEWS_API = "/api/pilot/reviews" as const;

export function PilotReviewsView() {
  const [reviews, setReviews] = useState<ReviewListItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadReviews = useCallback(() => {
    setLoading(true);
    setError(null);
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

  const [reconsiderations, setReconsiderations] = useState<
    Record<string, ReconsiderationStatus>
  >({});

  const loadReconsiderations = useCallback(() => {
    fetch("/api/pilot/reviews/reconsideration")
      .then((res) => res.json())
      .then((data) => {
        const map: Record<string, ReconsiderationStatus> = {};
        for (const r of (data.requests ?? []) as {
          reviewId: string;
          status: ReconsiderationStatus;
        }[]) {
          map[r.reviewId] = r.status;
        }
        setReconsiderations(map);
      })
      .catch(() => {
        /* ignore */
      });
  }, []);

  useEffect(() => {
    loadReviews();
    loadReconsiderations();
  }, [loadReviews, loadReconsiderations]);

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
          <div className="pilot-reviews-banner pilot-reviews-banner--error" role="alert">
            <p>{error}</p>
            <button type="button" className="pilot-reviews-btn-outline" onClick={loadReviews}>
              Retry
            </button>
          </div>
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
                  <PilotReviewRowCard
                    key={row.id}
                    row={row}
                    status={reconsiderations[row.id] ?? null}
                    onRequested={loadReconsiderations}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </section>

      <div className="pilot-reviews-actions">
        <Link href="/dashboard/pilot/contracts" className="pilot-reviews-btn-gold">
          Active Contracts
        </Link>
        <ReviewResetButton />
      </div>
    </div>
  );
}

function ReviewResetButton() {
  const [nonFiveStarCount, setNonFiveStarCount] = useState(0);
  const [hasPending, setHasPending] = useState(false);
  const [used, setUsed] = useState(false);
  const [feeNote, setFeeNote] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/pilot/reviews/reset-request")
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok || cancelled) return;
        setNonFiveStarCount(data.nonFiveStarCount ?? 0);
        setHasPending(Boolean(data.pendingRequest));
        setUsed(Boolean(data.used));
        setFeeNote(typeof data.feeNote === "string" ? data.feeNote : null);
      })
      .catch(() => {
        /* ignore */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function submit() {
    if (busy || hasPending || used) return;
    if (nonFiveStarCount === 0) {
      setMessage("You have no published reviews below 5 stars.");
      return;
    }
    const confirmed = window.confirm(
      `Request a one-time removal of ${nonFiveStarCount} review(s) below 5 stars? 5-star reviews stay. A moderator must approve. You can only use this once.`,
    );
    if (!confirmed) return;

    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/pilot/reviews/reset-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          note: "Please remove all non-5★ reviews from my profile.",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error ?? "Could not submit reset request.");
      } else {
        setHasPending(true);
        setMessage("Reset request submitted. Moderators will review it shortly.");
      }
    } catch {
      setMessage("Could not submit reset request.");
    } finally {
      setBusy(false);
    }
  }

  const label = used
    ? "Reset already used"
    : hasPending
      ? "Reset requested"
      : "Request review reset";

  return (
    <div className="pilot-reviews-reset-wrap">
      <button
        type="button"
        className="pilot-reviews-btn-outline"
        disabled={busy || hasPending || used}
        onClick={() => void submit()}
        title="One-time request to hide reviews below 5 stars (admin approved)"
      >
        {label}
      </button>
      {feeNote ? <p className="pilot-reviews-reset-msg">{feeNote}</p> : null}
      {message ? <p className="pilot-reviews-reset-msg">{message}</p> : null}
    </div>
  );
}

function PilotReviewRowCard({
  row,
  status,
  onRequested,
}: {
  row: PilotReviewRow;
  status: ReconsiderationStatus | null;
  onRequested: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function requestReconsideration() {
    if (busy) return;
    const note = window.prompt(
      "Optional message to the client (free request — the client decides whether to keep or update the review):",
      "",
    );
    if (note === null) return;
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/pilot/reviews/reconsideration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewId: row.id, note }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error ?? "Could not send request.");
      } else {
        onRequested();
      }
    } catch {
      setMessage("Could not send request.");
    } finally {
      setBusy(false);
    }
  }

  const canRequest = !status && row.rating < 5 && !row.id.startsWith("mock-");

  return (
    <article className="pilot-reviews-row">
      <div className="pilot-reviews-row-top">
        <h3 className="pilot-reviews-row-title">{row.title}</h3>
        <span className="pilot-reviews-row-date">{row.date}</span>
        <PilotReviewsStars value={row.rating} className="pilot-reviews-row-stars" />
      </div>
      <p className="pilot-reviews-row-text">{row.text}</p>
      {status ? (
        <p className="pilot-reviews-reset-msg">{RECONSIDERATION_LABELS[status]}</p>
      ) : null}
      {canRequest ? (
        <button
          type="button"
          className="pilot-reviews-btn-outline"
          disabled={busy}
          onClick={() => void requestReconsideration()}
        >
          Ask client to reconsider
        </button>
      ) : null}
      {message ? <p className="pilot-reviews-reset-msg">{message}</p> : null}
    </article>
  );
}
