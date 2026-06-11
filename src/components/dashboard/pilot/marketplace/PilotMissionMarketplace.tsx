"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { PilotMissionCardView } from "@/components/dashboard/pilot/marketplace/PilotMissionCard";
import {
  filterMissionCards,
  mapOpenJobToMissionCard,
} from "@/lib/pilot/marketplace-map";
import { PILOT_MARKETPLACE_MOCK_JOBS } from "@/lib/pilot/marketplace-mock";
import type { PilotJobsListResponse } from "@/types/application";

const FILTER_PILLS = [
  "LOCATION",
  "SERVICE",
  "BUDGET",
  "DEADLINE",
  "RANK",
  "DISTANCE",
] as const;

const JOBS_API = "/api/pilot/jobs" as const;

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.25" />
      <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
    </svg>
  );
}

export function PilotMissionMarketplace() {
  const [data, setData] = useState<PilotJobsListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  useEffect(() => {
    fetch(JOBS_API)
      .then((res) => res.json())
      .then((json) => {
        if (json.error) {
          setError(json.error);
        } else {
          setData(json as PilotJobsListResponse);
        }
      })
      .catch(() => setError("Failed to load marketplace jobs."))
      .finally(() => setLoading(false));
  }, []);

  const { missions, usingMock } = useMemo(() => {
    const live = (data?.jobs ?? []).map(mapOpenJobToMissionCard);
    if (live.length > 0) {
      return { missions: live, usingMock: false };
    }
    return { missions: [...PILOT_MARKETPLACE_MOCK_JOBS], usingMock: true };
  }, [data?.jobs]);

  const filteredMissions = useMemo(
    () => filterMissionCards(missions, search),
    [missions, search],
  );

  if (loading) {
    return <p className="pilot-marketplace-muted">Loading mission marketplace…</p>;
  }

  if (error && !data?.membership) {
    return (
      <div className="pilot-marketplace-empty">
        <h2 className="pilot-marketplace-empty-title">Marketplace unavailable</h2>
        <p className="pilot-marketplace-muted">{error}</p>
        <Link href="/dashboard/pilot/subscription" className="pilot-marketplace-empty-link">
          View membership tiers →
        </Link>
      </div>
    );
  }

  return (
    <div className="pilot-marketplace-page">
      <header className="pilot-marketplace-header">
        <p className="pilot-marketplace-eyebrow">OPERATIONS / MARKETPLACE</p>
        <h1 className="pilot-marketplace-title">Mission Marketplace</h1>
      </header>

      <div className="pilot-marketplace-toolbar">
        <label className="pilot-marketplace-search">
          <SearchIcon />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="SEARCH JOBS BY TITLE, CLIENT, OR KEYWORD..."
            className="pilot-marketplace-search-input"
          />
        </label>

        <div className="pilot-marketplace-filters" role="group" aria-label="Job filters">
          {FILTER_PILLS.map((pill) => (
            <button
              key={pill}
              type="button"
              className={
                activeFilter === pill
                  ? "pilot-marketplace-filter pilot-marketplace-filter--active"
                  : "pilot-marketplace-filter"
              }
              onClick={() =>
                setActiveFilter((current) => (current === pill ? null : pill))
              }
              title="Advanced filtering pending backend (M80)"
            >
              {pill}
            </button>
          ))}
        </div>
      </div>

      {data?.membership ? (
        <p className="pilot-marketplace-tier-note" role="status">
          <strong>{data.membership.tierName}</strong> — jobs visible{" "}
          {data.membership.jobVisibilityDelayHours === 0
            ? "immediately"
            : `${data.membership.jobVisibilityDelayHours}h after admin approval`}
          {data.membership.canApply ? "" : " · bidding requires A-2 or higher"}
        </p>
      ) : null}

      {data?.applyBlockedMessage ? (
        <p className="pilot-marketplace-banner" role="status">
          {data.applyBlockedMessage}
        </p>
      ) : null}

      {usingMock ? (
        <p className="pilot-marketplace-banner pilot-marketplace-banner--muted" role="status">
          Showing sample missions until admin-approved jobs are available on your tier.
        </p>
      ) : null}

      {activeFilter ? (
        <p className="pilot-marketplace-banner pilot-marketplace-banner--muted" role="status">
          {activeFilter} filter is a UI placeholder — server-side filtering pending (M80).
        </p>
      ) : null}

      {error && data?.membership ? (
        <p className="pilot-marketplace-banner pilot-marketplace-banner--error" role="alert">
          {error}
        </p>
      ) : null}

      {filteredMissions.length === 0 ? (
        <div className="pilot-marketplace-empty">
          <h2 className="pilot-marketplace-empty-title">No missions found</h2>
          <p className="pilot-marketplace-muted">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      ) : (
        <div className="pilot-marketplace-grid">
          {filteredMissions.map((mission) => (
            <PilotMissionCardView key={mission.id} mission={mission} />
          ))}
        </div>
      )}

      {!usingMock && (data?.lockedJobs?.length ?? 0) > 0 ? (
        <section className="pilot-marketplace-locked">
          <h2 className="pilot-marketplace-locked-title">
            LOCKED MISSIONS · VISIBILITY COUNTDOWN
          </h2>
          <ul className="pilot-marketplace-locked-list">
            {data!.lockedJobs.map((job) => (
              <li key={job.id} className="pilot-marketplace-locked-row">
                <div>
                  <p className="pilot-marketplace-locked-name">{job.title}</p>
                  <p className="pilot-marketplace-locked-meta">{job.locationLabel}</p>
                </div>
                <p className="pilot-marketplace-locked-time">
                  Unlocks{" "}
                  {new Date(job.visibleAt).toLocaleString(undefined, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
