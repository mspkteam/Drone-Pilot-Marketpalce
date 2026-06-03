"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatJobBudget } from "@/lib/jobs/format-budget";
import { JOB_CATEGORIES, type JobCategoryId } from "@/types/job";
import type {
  PilotJobsListResponse,
  PilotLockedJobDto,
  PilotOpenJobDto,
} from "@/types/application";

function categoryLabel(id: string) {
  return JOB_CATEGORIES.find((c) => c.id === id)?.label ?? id;
}

function formatVisibleAt(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function PilotOpenJobsList() {
  const [data, setData] = useState<PilotJobsListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/pilot/jobs")
      .then((res) => res.json())
      .then((json) => {
        if (json.error) {
          setError(json.error);
        } else {
          setData(json as PilotJobsListResponse);
        }
      })
      .catch(() => setError("Failed to load jobs."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading open jobs…</p>;
  }

  if (error) {
    return (
      <p className="text-sm text-destructive" role="alert">
        {error}
      </p>
    );
  }

  if (!data?.membership) {
    return (
      <div className="empty-state">
        <p className="text-muted-foreground">
          Enroll in a membership tier to browse marketplace jobs.
        </p>
        <Link
          href="/dashboard/pilot/subscription"
          className="mt-4 inline-block text-sm font-medium text-gold-dark hover:underline"
        >
          View membership tiers →
        </Link>
      </div>
    );
  }

  const jobs = data.jobs ?? [];
  const lockedJobs = data.lockedJobs ?? [];

  return (
    <div className="space-y-6">
      {data.membership ? (
        <p className="rounded-lg border border-border bg-surface-elevated px-4 py-3 text-sm text-muted-foreground">
          <strong>{data.membership.tierName}</strong> — jobs visible{" "}
          {data.membership.jobVisibilityDelayHours === 0
            ? "immediately"
            : `${data.membership.jobVisibilityDelayHours}h after admin approval`}
          {data.membership.canApply ? "" : " · bidding requires A-2 or higher"}
        </p>
      ) : null}

      {data.applyBlockedMessage ? (
        <p className="rounded-lg border border-gold/30 bg-gold/10 px-4 py-3 text-sm text-gold-dark">
          {data.applyBlockedMessage}
        </p>
      ) : null}

      {jobs.length === 0 && lockedJobs.length === 0 ? (
        <div className="empty-state">
          <p className="text-muted-foreground">
            No open jobs right now. Check back after admins approve client postings.
          </p>
        </div>
      ) : (
        <>
          {jobs.length > 0 ? (
            <ul className="list-panel">
              {jobs.map((job) => (
                <JobRow key={job.id} job={job} />
              ))}
            </ul>
          ) : null}

          {lockedJobs.length > 0 ? (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground">
                Coming soon (tier visibility delay)
              </h3>
              <ul className="mt-2 divide-y divide-border rounded-lg border border-dashed border-border">
                {lockedJobs.map((job) => (
                  <LockedJobRow key={job.id} job={job} />
                ))}
              </ul>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}

function JobRow({ job }: { job: PilotOpenJobDto }) {
  const budget = formatJobBudget(job.budgetMin, job.budgetMax, job.currency);
  return (
    <li>
      <Link
        href={`/dashboard/pilot/jobs/${job.id}`}
        className="list-panel-row"
      >
        <div>
          <p className="font-medium">{job.title}</p>
          <p className="text-sm text-muted-foreground">
            {categoryLabel(job.category as JobCategoryId)} · {job.locationLabel}
            {budget ? ` · ${budget}` : ""}
          </p>
        </div>
        {job.hasApplied ? (
          <span className="inline-flex rounded-full border border-gold/30 bg-gold/10 px-2.5 py-0.5 text-xs font-medium text-gold-dark">
            Applied
          </span>
        ) : job.canApply ? (
          <span className="inline-flex rounded-full border border-border bg-surface px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
            Open
          </span>
        ) : (
          <span className="inline-flex rounded-full border border-border px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
            View only
          </span>
        )}
      </Link>
    </li>
  );
}

function LockedJobRow({ job }: { job: PilotLockedJobDto }) {
  return (
    <li className="flex flex-col gap-1 p-4 opacity-80 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-medium">{job.title}</p>
        <p className="text-sm text-muted-foreground">{job.locationLabel}</p>
      </div>
      <span className="text-xs text-muted-foreground">
        Visible {formatVisibleAt(job.visibleAt)}
      </span>
    </li>
  );
}
