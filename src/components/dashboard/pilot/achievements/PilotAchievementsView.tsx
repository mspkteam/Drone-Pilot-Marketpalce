"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { WingBadge } from "@/components/wings/WingBadge";
import { getWingCategoryLabel } from "@/lib/wings/status";
import type { PilotWingDto } from "@/types/wing";

export function PilotAchievementsView() {
  const [wings, setWings] = useState<PilotWingDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/pilot/wings");
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to load wings.");
        setWings([]);
      } else {
        setWings(data.wings ?? []);
      }
    } catch {
      setError("Failed to load wings.");
      setWings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="pilot-achievements-page">
      <header className="pilot-achievements-header pilot-achievements-bracket-card">
        <p className="pilot-achievements-eyebrow">PILOT / DIGITAL WINGS</p>
        <h1 className="pilot-achievements-title-main">Digital Wings</h1>
        <p className="pilot-achievements-lead">
          Milestone badges earned automatically from bookings, reviews,
          verifications, and certificates — or awarded by admins.
        </p>
      </header>

      <section className="pilot-achievements-panel" aria-label="Digital Wings">
        <h2 className="pilot-achievements-panel-title">EARNED WINGS</h2>

        {error ? (
          <p className="pilot-achievements-banner" role="alert">
            {error}
          </p>
        ) : null}

        {loading ? (
          <p className="pilot-achievements-loading">Loading wings…</p>
        ) : wings.length === 0 ? (
          <>
            <p className="pilot-achievements-empty">
              No wings earned yet. Complete bookings and build trust to unlock
              milestones.
            </p>
            <ul className="pilot-achievements-empty-links">
              <li>
                <Link href="/dashboard/pilot/verifications/request-wings">
                  Request Wings
                </Link>
              </li>
              <li>
                <Link href="/dashboard/pilot/contracts">Active contracts</Link>
              </li>
              <li>
                <Link href="/dashboard/pilot/verifications">Verifications</Link>
              </li>
            </ul>
          </>
        ) : (
          <ul className="pilot-achievements-grid">
            {wings.map((wing) => (
              <li key={wing.id} className="pilot-achievements-card">
                <div className="pilot-achievements-card-top">
                  <WingBadge
                    title={wing.title}
                    iconLabel={wing.iconLabel}
                    imageUrl={wing.imageUrl}
                    category={wing.category}
                    size="md"
                  />
                  <span className="pilot-achievements-source">
                    {wing.source === "auto" ? "Auto" : "Awarded"}
                  </span>
                </div>
                <p className="pilot-achievements-card-desc">{wing.description}</p>
                <p className="pilot-achievements-card-meta">
                  {getWingCategoryLabel(wing.category)} · Earned{" "}
                  {new Date(wing.earnedAt).toLocaleDateString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
