"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { PilotMissionCardView } from "@/components/dashboard/pilot/marketplace/PilotMissionCard";
import { mapOpenJobToMissionCard } from "@/lib/pilot/marketplace-map";
import type { PilotJobsListResponse } from "@/types/application";
import { JOB_CATEGORIES } from "@/types/job";

const JOBS_API = "/api/pilot/jobs" as const;

const FILTER_PILLS = ["SERVICE", "BUDGET"] as const;
type FilterPill = (typeof FILTER_PILLS)[number];

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.25" />
      <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
    </svg>
  );
}

function buildJobsUrl(options: {
  q: string;
  category: string;
  budgetMin: string;
  budgetMax: string;
}): string {
  const params = new URLSearchParams();
  if (options.q.trim()) params.set("q", options.q.trim());
  if (options.category) params.set("category", options.category);
  if (options.budgetMin.trim()) params.set("budgetMin", options.budgetMin.trim());
  if (options.budgetMax.trim()) params.set("budgetMax", options.budgetMax.trim());
  const query = params.toString();
  return query ? `${JOBS_API}?${query}` : JOBS_API;
}

export function PilotMissionMarketplace() {
  const [data, setData] = useState<PilotJobsListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterPill | null>(null);
  const [category, setCategory] = useState("");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search), 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  const loadJobs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        buildJobsUrl({
          q: debouncedSearch,
          category: activeFilter === "SERVICE" ? category : "",
          budgetMin: activeFilter === "BUDGET" ? budgetMin : "",
          budgetMax: activeFilter === "BUDGET" ? budgetMax : "",
        }),
      );
      const json = await res.json();
      if (json.error) {
        setError(json.error);
      } else {
        setData(json as PilotJobsListResponse);
      }
    } catch {
      setError("Failed to load marketplace jobs.");
    } finally {
      setLoading(false);
    }
  }, [activeFilter, budgetMax, budgetMin, category, debouncedSearch]);

  useEffect(() => {
    void loadJobs();
  }, [loadJobs]);

  const missions = useMemo(
    () => (data?.jobs ?? []).map(mapOpenJobToMissionCard),
    [data?.jobs],
  );

  if (loading && !data) {
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
            >
              {pill}
            </button>
          ))}
        </div>
      </div>

      {activeFilter === "SERVICE" ? (
        <label className="pilot-marketplace-filter-field">
          <span>Service category</span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="pilot-marketplace-filter-select"
          >
            <option value="">All categories</option>
            {JOB_CATEGORIES.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      {activeFilter === "BUDGET" ? (
        <div className="pilot-marketplace-filter-row">
          <label className="pilot-marketplace-filter-field">
            <span>Min budget</span>
            <input
              type="number"
              min={0}
              value={budgetMin}
              onChange={(e) => setBudgetMin(e.target.value)}
              className="pilot-marketplace-filter-input"
            />
          </label>
          <label className="pilot-marketplace-filter-field">
            <span>Max budget</span>
            <input
              type="number"
              min={0}
              value={budgetMax}
              onChange={(e) => setBudgetMax(e.target.value)}
              className="pilot-marketplace-filter-input"
            />
          </label>
        </div>
      ) : null}

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

      {missions.length === 0 && !error && !loading ? (
        <p className="pilot-marketplace-banner pilot-marketplace-banner--muted" role="status">
          No open missions match your filters yet. Admin-approved jobs appear here after
          your membership visibility delay.
        </p>
      ) : null}

      {error && data?.membership ? (
        <p className="pilot-marketplace-banner pilot-marketplace-banner--error" role="alert">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="pilot-marketplace-muted">Updating missions…</p>
      ) : missions.length === 0 ? (
        <div className="pilot-marketplace-empty">
          <h2 className="pilot-marketplace-empty-title">No missions found</h2>
          <p className="pilot-marketplace-muted">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      ) : (
        <div className="pilot-marketplace-grid">
          {missions.map((mission) => (
            <PilotMissionCardView key={mission.id} mission={mission} />
          ))}
        </div>
      )}

      {(data?.lockedJobs?.length ?? 0) > 0 ? (
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
