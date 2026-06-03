"use client";

import { useCallback, useEffect, useState } from "react";
import { ApplicationStatusBadge } from "@/components/applications/ApplicationStatusBadge";
import { Button } from "@/components/ui/Button";
import type { AdminApplicationDto } from "@/types/admin";
import type { ApplicationStatus } from "@/types/application";

export function AdminApplicationsPanel() {
  const [applications, setApplications] = useState<AdminApplicationDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/applications");
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to load applications.");
        setApplications([]);
      } else {
        setApplications(data.applications ?? []);
      }
    } catch {
      setError("Failed to load applications.");
      setApplications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-6">
      <Button type="button" variant="ghost" size="sm" onClick={() => void load()}>
        Refresh
      </Button>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading applications…</p>
      ) : applications.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No applications yet.
        </p>
      ) : (
        <ul className="divide-y divide-border rounded-lg border border-border">
          {applications.map((a) => (
            <li
              key={a.id}
              className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium">{a.jobTitle}</p>
                <p className="text-sm text-muted-foreground">
                  {a.pilotName} · {a.currency} {a.proposedAmount.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(a.submittedAt).toLocaleString()}
                </p>
              </div>
              <ApplicationStatusBadge status={a.status as ApplicationStatus} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
