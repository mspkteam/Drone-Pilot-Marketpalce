"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { PilotLockedJobCardView } from "@/components/dashboard/pilot/locked-jobs/PilotLockedJobCard";
import { PILOT_DASHBOARD_ROUTES } from "@/lib/pilot/dashboard-overview-mock";
import { mapLockedJobToCard } from "@/lib/pilot/locked-jobs-map";
import type { PilotJobsListResponse } from "@/types/application";

const JOBS_API = "/api/pilot/jobs" as const;

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
      <header className="pilot-locked-jobs-header pilot-locked-jobs-bracket-card">
        <p className="pilot-locked-jobs-eyebrow">OPERATIONS / LOCKED</p>
        <h1 className="pilot-locked-jobs-title">Locked Jobs</h1>
      </header>

      <div
        className="pilot-locked-jobs-notice pilot-locked-jobs-bracket-card"
        role="status"
      >
        <img
          src="/icons/pilot-dashboard/locked-crown.svg"
          alt=""
          width={19}
          height={16}
          className="pilot-locked-jobs-notice-icon"
        />
        <p className="pilot-locked-jobs-notice-copy">
          These jobs unlock based on Remote Air Service job-posting visibility by
          grade.
          <br />
          Upgrade to A-4 Senior Flight Officer or higher for faster job visibility.
        </p>
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
