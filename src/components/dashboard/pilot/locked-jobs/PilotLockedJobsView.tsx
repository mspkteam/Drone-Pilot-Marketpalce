"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { PilotLockedJobCardView } from "@/components/dashboard/pilot/locked-jobs/PilotLockedJobCard";
import { PILOT_DASHBOARD_ROUTES } from "@/lib/pilot/dashboard-overview-mock";
import { mapLockedJobToCard } from "@/lib/pilot/locked-jobs-map";
import type { PilotJobsListResponse } from "@/types/application";

const JOBS_API = "/api/pilot/jobs" as const;

function CrownIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <path
        d="M2.5 13.5h13M3.5 11.5L5 5.5l2.5 2 2-3.5 2 3.5 2.5-2 1.5 6"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PilotLockedJobsView() {
  const [data, setData] = useState<PilotJobsListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      .catch(() => setError("Failed to load locked jobs."))
      .finally(() => setLoading(false));
  }, []);

  const jobs = useMemo(
    () => (data?.lockedJobs ?? []).map(mapLockedJobToCard),
    [data?.lockedJobs],
  );

  if (loading) {
    return <p className="pilot-locked-jobs-muted">Loading locked missions…</p>;
  }

  if (error && !data?.membership) {
    return (
      <div className="pilot-locked-jobs-empty">
        <h2 className="pilot-locked-jobs-empty-title">Locked jobs unavailable</h2>
        <p className="pilot-locked-jobs-muted">{error}</p>
        <Link href={PILOT_DASHBOARD_ROUTES.subscription} className="pilot-locked-jobs-empty-link">
          View membership tiers →
        </Link>
      </div>
    );
  }

  return (
    <div className="pilot-locked-jobs-page">
      <header className="pilot-locked-jobs-header">
        <p className="pilot-locked-jobs-eyebrow">OPERATIONS / LOCKED</p>
        <h1 className="pilot-locked-jobs-title">Locked Jobs</h1>
      </header>

      <div className="pilot-locked-jobs-notice" role="status">
        <span className="pilot-locked-jobs-notice-icon" aria-hidden>
          <CrownIcon />
        </span>
        <div className="pilot-locked-jobs-notice-copy">
          <p className="pilot-locked-jobs-notice-primary">
            THESE JOBS WILL UNLOCK SOON BASED ON YOUR CURRENT PILOT LEVEL.
          </p>
          <p className="pilot-locked-jobs-notice-secondary">
            UPGRADE TO{" "}
            <span className="pilot-locked-jobs-notice-gold">A-4 CERTIFIED OR HIGHER</span>{" "}
            FOR INSTANT ACCESS TO HIGH-TIER MISSIONS.
          </p>
        </div>
      </div>

      {data?.membership ? (
        <p className="pilot-locked-jobs-tier-note">
          Current tier: <strong>{data.membership.tierName}</strong> — visibility delay{" "}
          {data.membership.jobVisibilityDelayHours === 0
            ? "none"
            : `${data.membership.jobVisibilityDelayHours}h`}
        </p>
      ) : null}

      {jobs.length === 0 && !error ? (
        <p className="pilot-locked-jobs-banner" role="status">
          No locked missions right now. Higher-tier jobs with visibility delays will
          appear here.
        </p>
      ) : null}

      {error && data?.membership ? (
        <p className="pilot-locked-jobs-banner pilot-locked-jobs-banner--error" role="alert">
          {error}
        </p>
      ) : null}

      <div className="pilot-locked-jobs-grid">
        {jobs.map((job) => (
          <PilotLockedJobCardView key={job.id} job={job} />
        ))}
      </div>
    </div>
  );
}
