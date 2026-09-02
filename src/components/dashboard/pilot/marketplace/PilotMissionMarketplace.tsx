"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { PilotMissionCardView } from "@/components/dashboard/pilot/marketplace/PilotMissionCard";
import { mapOpenJobToMissionCard } from "@/lib/pilot/marketplace-map";
import type { PilotJobsListResponse, PilotOpenJobDto } from "@/types/application";
import { JOB_CATEGORIES } from "@/types/job";
import { cn } from "@/lib/utils";

const JOBS_API = "/api/pilot/jobs" as const;

const FILTER_PILLS = [
  "LOCATION",
  "SERVICE",
  "BUDGET",
  "DEADLINE",
  "GRADE",
] as const;
type FilterPill = (typeof FILTER_PILLS)[number];

type DeadlineMode = "all" | "soonest" | "dated" | "flexible";

function buildJobsUrl(options: {
  q: string;
  location: string;
  category: string;
  budgetMin: string;
  budgetMax: string;
}): string {
  const params = new URLSearchParams();
  if (options.q.trim()) params.set("q", options.q.trim());
  if (options.location.trim()) params.set("location", options.location.trim());
  if (options.category) params.set("category", options.category);
  if (options.budgetMin.trim()) params.set("budgetMin", options.budgetMin.trim());
  if (options.budgetMax.trim()) params.set("budgetMax", options.budgetMax.trim());
  const query = params.toString();
  return query ? `${JOBS_API}?${query}` : JOBS_API;
}

function applyDeadlineFilter(
  jobs: PilotOpenJobDto[],
  mode: DeadlineMode,
): PilotOpenJobDto[] {
  if (mode === "all") return jobs;
  if (mode === "dated") return jobs.filter((job) => job.scheduledDate != null);
  if (mode === "flexible") return jobs.filter((job) => job.scheduledDate == null);
  return [...jobs].sort((a, b) => {
    if (!a.scheduledDate && !b.scheduledDate) return 0;
    if (!a.scheduledDate) return 1;
    if (!b.scheduledDate) return -1;
    return (
      new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()
    );
  });
}

export function PilotMissionMarketplace() {
  const [data, setData] = useState<PilotJobsListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterPill | null>(null);
  const [location, setLocation] = useState("");
  const [debouncedLocation, setDebouncedLocation] = useState("");
  const [category, setCategory] = useState("");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [deadlineMode, setDeadlineMode] = useState<DeadlineMode>("all");

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search), 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedLocation(location), 300);
    return () => window.clearTimeout(timer);
  }, [location]);

  const loadJobs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        buildJobsUrl({
          q: debouncedSearch,
          location: debouncedLocation,
          category,
          budgetMin,
          budgetMax,
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
  }, [budgetMax, budgetMin, category, debouncedLocation, debouncedSearch]);

  useEffect(() => {
    void loadJobs();
  }, [loadJobs]);

  const missions = useMemo(() => {
    const filtered = applyDeadlineFilter(data?.jobs ?? [], deadlineMode);
    return filtered.map(mapOpenJobToMissionCard);
  }, [data?.jobs, deadlineMode]);

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
      <header className="pilot-marketplace-header pilot-marketplace-bracket-card">
        <p className="pilot-marketplace-eyebrow">OPERATIONS / MARKETPLACE</p>
        <h1 className="pilot-marketplace-title">Mission Marketplace</h1>
      </header>

      <div className="pilot-marketplace-toolbar pilot-marketplace-bracket-card">
        <label className="pilot-marketplace-search">
          <img
            src="/icons/pilot-dashboard/marketplace-search.svg"
            alt=""
            width={16}
            height={16}
            className="pilot-marketplace-search-icon"
          />
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
              className={cn(
                "pilot-marketplace-filter",
                activeFilter === pill && "pilot-marketplace-filter--active",
              )}
              onClick={() =>
                setActiveFilter((current) => (current === pill ? null : pill))
              }
            >
              {pill}
            </button>
          ))}
        </div>
      </div>

      {activeFilter === "LOCATION" ? (
        <label className="pilot-marketplace-filter-field">
          <span>Location</span>
          <input
            type="search"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="City, region, or site…"
            className="pilot-marketplace-filter-input"
          />
        </label>
      ) : null}

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

      {activeFilter === "DEADLINE" ? (
        <label className="pilot-marketplace-filter-field">
          <span>Deadline</span>
          <select
            value={deadlineMode}
            onChange={(e) => setDeadlineMode(e.target.value as DeadlineMode)}
            className="pilot-marketplace-filter-select"
          >
            <option value="all">All missions</option>
            <option value="soonest">Soonest first</option>
            <option value="dated">Has scheduled date</option>
            <option value="flexible">Flexible / TBD</option>
          </select>
        </label>
      ) : null}

      {activeFilter === "GRADE" ? (
        <p className="pilot-marketplace-filter-note" role="status">
          Grade controls when approved jobs unlock for your membership.{" "}
          <Link href="/dashboard/pilot/subscription">View membership →</Link>
        </p>
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
