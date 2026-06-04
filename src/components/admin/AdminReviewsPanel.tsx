"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import type { AdminReviewDto } from "@/types/admin";
import type { ReviewStatus } from "@/types/review";
import { cn } from "@/lib/utils";

const FILTERS: { value: ReviewStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "published", label: "Published" },
  { value: "flagged", label: "Flagged" },
  { value: "hidden", label: "Hidden" },
];

export function AdminReviewsPanel() {
  const [filter, setFilter] = useState<ReviewStatus | "all">("all");
  const [reviews, setReviews] = useState<AdminReviewDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actingId, setActingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/reviews?status=${filter}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to load reviews.");
        setReviews([]);
      } else {
        setReviews(data.reviews ?? []);
      }
    } catch {
      setError("Failed to load reviews.");
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    void load();
  }, [load]);

  async function setStatus(reviewId: string, status: ReviewStatus) {
    setActingId(reviewId);
    setError(null);
    try {
      const res = await fetch(`/api/admin/reviews/${reviewId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Update failed.");
      } else {
        await load();
      }
    } catch {
      setError("Update failed.");
    } finally {
      setActingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="dashboard-filter-bar">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFilter(f.value)}
            className={cn(
              "filter-pill", filter === f.value && "filter-pill-active"
            )}
          >
            {f.label}
          </button>
        ))}
        <Button type="button" variant="ghost" size="sm" onClick={() => void load()}>
          Refresh
        </Button>
      </div>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading reviews…</p>
      ) : reviews.length === 0 ? (
        <p className="empty-state">
          No reviews in this queue.
        </p>
      ) : (
        <ul className="list-panel">
          {reviews.map((r) => (
            <li
              key={r.id}
              className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between"
            >
              <div>
                <p className="font-medium">
                  {r.rating}★ · {r.jobTitle}
                </p>
                <p className="text-sm text-muted-foreground">
                  By {r.authorEmail} → {r.targetLabel}
                </p>
                {r.comment ? (
                  <p className="mt-2 text-sm">{r.comment}</p>
                ) : null}
                <p className="mt-1 text-xs capitalize text-muted-foreground">
                  Status: {r.status}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {r.status !== "published" ? (
                  <Button
                    type="button"
                    size="sm"
                    disabled={actingId === r.id}
                    onClick={() => void setStatus(r.id, "published")}
                  >
                    Publish
                  </Button>
                ) : null}
                {r.status !== "hidden" ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    disabled={actingId === r.id}
                    onClick={() => void setStatus(r.id, "hidden")}
                  >
                    Hide
                  </Button>
                ) : null}
                {r.status !== "flagged" ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    disabled={actingId === r.id}
                    onClick={() => void setStatus(r.id, "flagged")}
                  >
                    Flag
                  </Button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
