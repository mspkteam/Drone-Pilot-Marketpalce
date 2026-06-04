"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { DisputeStatusBadge } from "@/components/disputes/DisputeStatusBadge";
import { disputeStatusFilterTabs } from "@/lib/ui/status-filter-tabs";
import type { DisputeListItemDto, DisputeStatus } from "@/types/dispute";
import { cn } from "@/lib/utils";

const FILTERS = disputeStatusFilterTabs();

export function AdminDisputesPanel() {
  const [filter, setFilter] = useState<DisputeStatus | "all">("open");
  const [disputes, setDisputes] = useState<DisputeListItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/disputes?status=${filter}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to load disputes.");
        setDisputes([]);
      } else {
        setDisputes(data.disputes ?? []);
      }
    } catch {
      setError("Failed to load disputes.");
      setDisputes([]);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-6">
      <div className="dashboard-filter-bar">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFilter(f.value)}
            className={cn(
              "filter-pill",
              filter === f.value && "filter-pill-active",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading disputes…</p>
      ) : disputes.length === 0 ? (
        <p className="text-sm text-muted-foreground">No disputes in this queue.</p>
      ) : (
        <ul className="list-panel">
          {disputes.map((d) => (
            <li key={d.id} className="p-4 hover:bg-surface/50">
              <Link
                href={`/dashboard/admin/disputes/${d.id}`}
                className="block space-y-2"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-medium">{d.booking.job.title}</span>
                  <DisputeStatusBadge status={d.status} />
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {d.reason}
                </p>
                <p className="text-xs text-muted-foreground">
                  {d.booking.client.companyName ?? d.booking.client.contactName}{" "}
                  ↔ {d.booking.pilot.displayName} · ${d.booking.agreedAmount}{" "}
                  {d.booking.currency} · {d.entryCount} entries · opened by{" "}
                  {d.openedByRole}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
