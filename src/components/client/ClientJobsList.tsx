"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { JobStatusBadge } from "@/components/jobs/JobStatusBadge";
import { Button } from "@/components/ui/Button";
import { JOB_CATEGORIES, type JobDto } from "@/types/job";

function categoryLabel(id: string) {
  return JOB_CATEGORIES.find((c) => c.id === id)?.label ?? id;
}

export function ClientJobsList() {
  const [jobs, setJobs] = useState<JobDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/client/jobs")
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
    return <p className="text-sm text-muted-foreground">Loading jobs…</p>;
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
      <div className="empty-state">
        <p className="text-muted-foreground">No jobs posted yet.</p>
        <Button href="/dashboard/client/jobs/new" className="mt-4">
          Post your first job
        </Button>
      </div>
    );
  }

  return (
    <ul className="list-panel">
      {jobs.map((job) => (
        <li key={job.id}>
          <Link
            href={`/dashboard/client/jobs/${job.id}`}
            className="list-panel-row"
          >
            <div>
              <p className="font-medium">{job.title}</p>
              <p className="text-sm text-muted-foreground">
                {categoryLabel(job.category)} · {job.locationLabel}
              </p>
            </div>
            <JobStatusBadge status={job.status} />
          </Link>
        </li>
      ))}
    </ul>
  );
}
