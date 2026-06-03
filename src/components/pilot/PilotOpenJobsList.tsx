"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatJobBudget } from "@/lib/jobs/format-budget";
import { JOB_CATEGORIES, type JobCategoryId } from "@/types/job";
import type { PilotOpenJobDto } from "@/types/application";

function categoryLabel(id: string) {
  return JOB_CATEGORIES.find((c) => c.id === id)?.label ?? id;
}

export function PilotOpenJobsList() {
  const [jobs, setJobs] = useState<PilotOpenJobDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/pilot/jobs")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setJobs(data.jobs ?? []);
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

  if (jobs.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border p-8 text-center">
        <p className="text-muted-foreground">
          No open jobs right now. Check back after admins approve client postings.
        </p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-border rounded-lg border border-border">
      {jobs.map((job) => {
        const budget = formatJobBudget(job.budgetMin, job.budgetMax, job.currency);
        return (
          <li key={job.id}>
            <Link
              href={`/dashboard/pilot/jobs/${job.id}`}
              className="flex flex-col gap-2 p-4 transition-colors hover:bg-surface sm:flex-row sm:items-center sm:justify-between"
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
              ) : (
                <span className="inline-flex rounded-full border border-border bg-surface px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                  Open
                </span>
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
