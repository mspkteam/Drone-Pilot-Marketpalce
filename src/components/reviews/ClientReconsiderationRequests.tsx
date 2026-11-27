"use client";

import { useCallback, useEffect, useState } from "react";
import type { ReviewReconsiderationDto } from "@/lib/reviews/reconsideration";

/** Client-facing free review reconsideration: keep or update. Nothing is deleted. */
export function ClientReconsiderationRequests() {
  const [requests, setRequests] = useState<ReviewReconsiderationDto[]>([]);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    fetch("/api/client/reviews/reconsideration")
      .then((res) => res.json())
      .then((data) => setRequests(data.requests ?? []))
      .catch(() => setError("Failed to load reconsideration requests."));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function respond(req: ReviewReconsiderationDto, decision: "keep" | "update") {
    setBusyId(req.id);
    setError(null);
    try {
      const res = await fetch(`/api/client/reviews/reconsideration/${req.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          decision,
          ...(decision === "update"
            ? { rating: ratings[req.id] ?? req.previousRating }
            : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error ?? "Could not save your response.");
      else load();
    } catch {
      setError("Could not save your response.");
    } finally {
      setBusyId(null);
    }
  }

  const pending = requests.filter((r) => r.status === "pending");
  if (pending.length === 0 && !error) return null;

  return (
    <section className="mb-6 rounded-md border border-border p-4">
      <h2 className="font-medium">Review reconsideration requests</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        A pilot asked you to reconsider a review. This is free and optional — you can
        keep it as is or update the rating. Nothing is removed without you.
      </p>
      {error ? (
        <p className="mt-2 text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      <ul className="mt-3 space-y-4">
        {pending.map((req) => (
          <li key={req.id} className="text-sm">
            <p>
              <span className="font-medium">{req.pilotDisplayName}</span> ·{" "}
              {req.jobTitle} · currently {req.previousRating}★
            </p>
            {req.pilotNote ? (
              <p className="mt-1 text-muted-foreground">“{req.pilotNote}”</p>
            ) : null}
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <select
                aria-label="New rating"
                value={ratings[req.id] ?? req.previousRating}
                onChange={(e) =>
                  setRatings((prev) => ({ ...prev, [req.id]: Number(e.target.value) }))
                }
                disabled={busyId === req.id}
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n}★
                  </option>
                ))}
              </select>
              <button
                type="button"
                disabled={busyId === req.id}
                onClick={() => void respond(req, "update")}
              >
                Update rating
              </button>
              <button
                type="button"
                disabled={busyId === req.id}
                onClick={() => void respond(req, "keep")}
              >
                Keep as is
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
