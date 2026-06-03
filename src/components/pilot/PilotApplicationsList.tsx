"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ApplicationStatusBadge } from "@/components/applications/ApplicationStatusBadge";
import type { PilotApplicationListItemDto } from "@/types/application";
import type { ApplicationStatus } from "@/types/application";

export function PilotApplicationsList() {
  const [applications, setApplications] = useState<PilotApplicationListItemDto[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/pilot/applications")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setApplications(data.applications ?? []);
        }
      })
      .catch(() => setError("Failed to load applications."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading applications…</p>;
  }

  if (error) {
    return (
      <p className="text-sm text-destructive" role="alert">
        {error}
      </p>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border p-8 text-center">
        <p className="text-muted-foreground">No applications submitted yet.</p>
        <Link
          href="/dashboard/pilot/jobs"
          className="mt-4 inline-block text-sm text-gold-dark hover:text-gold"
        >
          Browse open jobs →
        </Link>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-border rounded-lg border border-border">
      {applications.map((app) => (
        <li key={app.id}>
          <Link
            href={`/dashboard/pilot/jobs/${app.jobId}`}
            className="flex flex-col gap-2 p-4 transition-colors hover:bg-surface sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-medium">{app.job.title}</p>
              <p className="text-sm text-muted-foreground">
                {app.job.locationLabel} · {app.currency}{" "}
                {app.proposedAmount.toLocaleString()}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Submitted {new Date(app.submittedAt).toLocaleDateString()}
              </p>
            </div>
            <ApplicationStatusBadge status={app.status as ApplicationStatus} />
          </Link>
        </li>
      ))}
    </ul>
  );
}
