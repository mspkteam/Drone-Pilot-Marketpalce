"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { DisputeStatusBadge } from "@/components/disputes/DisputeStatusBadge";
import { disputeStatusFilterTabs } from "@/lib/ui/status-filter-tabs";
import type { DisputeListItemDto, DisputeStatus } from "@/types/dispute";
import { cn } from "@/lib/utils";

const FILTERS = disputeStatusFilterTabs();
const DISPUTES_API = "/api/client/disputes" as const;

function formatDisputeDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatAmount(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount}`;
  }
}

export function ClientDisputesList() {
  const [filter, setFilter] = useState<DisputeStatus | "all">("all");
  const [disputes, setDisputes] = useState<DisputeListItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${DISPUTES_API}?status=${filter}`);
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
    <div className="client-disputes-page">
      <header className="client-disputes-header">
        <h1 className="client-disputes-title">Disputes</h1>
        <p className="client-disputes-subtitle">
          Track booking disputes, submit evidence, and follow moderator
          resolutions.
        </p>
      </header>

      <div className="client-disputes-filters" role="tablist" aria-label="Filter disputes">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            role="tab"
            aria-selected={filter === f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              "client-disputes-filter",
              filter === f.value && "client-disputes-filter--active",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error ? (
        <p className="client-disputes-banner client-disputes-banner--error" role="alert">
          {error}
        </p>
      ) : null}

      <section className="client-disputes-panel">
        {loading ? (
          <p className="client-disputes-muted">Loading disputes…</p>
        ) : disputes.length === 0 ? (
          <div className="client-disputes-empty">
            <p className="client-disputes-empty-title">No disputes yet</p>
            <p className="client-disputes-muted">
              If something goes wrong on a booking, open a dispute from the
              booking detail page while the job is confirmed, in progress, or
              completed.
            </p>
            <Link href="/dashboard/client/bookings" className="client-disputes-link">
              View bookings →
            </Link>
          </div>
        ) : (
          <ul className="client-disputes-list">
            {disputes.map((d) => (
              <li key={d.id}>
                <Link
                  href={`/dashboard/client/disputes/${d.id}`}
                  className="client-disputes-card"
                >
                  <div className="client-disputes-card-top">
                    <span className="client-disputes-card-title">
                      {d.booking.job.title}
                    </span>
                    <DisputeStatusBadge status={d.status} />
                  </div>
                  <p className="client-disputes-card-reason">{d.reason}</p>
                  <p className="client-disputes-card-meta">
                    Pilot: {d.booking.pilot.displayName} ·{" "}
                    {formatAmount(d.booking.agreedAmount, d.booking.currency)} ·{" "}
                    {d.entryCount} {d.entryCount === 1 ? "entry" : "entries"} ·
                    Updated {formatDisputeDate(d.updatedAt)}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
