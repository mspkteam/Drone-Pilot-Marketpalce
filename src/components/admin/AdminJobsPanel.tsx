"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { JobStatusBadge } from "@/components/jobs/JobStatusBadge";
import { Button } from "@/components/ui/Button";
import { jobAdminStatusFilterTabs } from "@/lib/ui/status-filter-tabs";
import { JOB_CATEGORIES, type JobStatus } from "@/types/job";
import type { AdminJobDto } from "@/types/admin-job";
import { cn } from "@/lib/utils";

const FILTERS = jobAdminStatusFilterTabs();

function categoryLabel(id: string) {
  return JOB_CATEGORIES.find((c) => c.id === id)?.label ?? id;
}

export function AdminJobsPanel() {
  const [filter, setFilter] = useState<JobStatus | "all">("pending_approval");
  const [jobs, setJobs] = useState<AdminJobDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadJobs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/jobs?status=${filter}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to load jobs.");
        setJobs([]);
      } else {
        setJobs(data.jobs ?? []);
      }
    } catch {
      setError("Failed to load jobs.");
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    void loadJobs();
  }, [loadJobs]);

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
        <Button type="button" variant="ghost" size="sm" onClick={() => void loadJobs()}>
          Refresh
        </Button>
      </div>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading jobs…</p>
      ) : jobs.length === 0 ? (
        <p className="empty-state">
          No jobs in this queue.
        </p>
      ) : (
        <ul className="list-panel">
          {jobs.map((job) => (
            <li key={job.id}>
              <Link
                href={`/dashboard/admin/jobs/${job.id}`}
                className="list-panel-row"
              >
                <div>
                  <p className="font-medium">{job.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {job.client.contactName}
                    {job.client.companyName
                      ? ` · ${job.client.companyName}`
                      : ""}{" "}
                    · {categoryLabel(job.category)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {job.locationLabel}
                    {job.submittedAt
                      ? ` · Submitted ${new Date(job.submittedAt).toLocaleDateString()}`
                      : ""}
                  </p>
                </div>
                <JobStatusBadge status={job.status} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
