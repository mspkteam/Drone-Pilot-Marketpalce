"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { PilotStatusBadge } from "@/components/pilot/PilotStatusBadge";
import { Button } from "@/components/ui/Button";
import { approvalStatusFilterTabs } from "@/lib/ui/status-filter-tabs";
import type { AdminPilotDto } from "@/types/admin";
import type { PilotProfileStatus } from "@/types/pilot";
import { cn } from "@/lib/utils";

const FILTERS = approvalStatusFilterTabs({
  pending: "pending_review",
  approved: "approved",
  rejected: "rejected",
});

export function AdminPilotsPanel() {
  const [filter, setFilter] = useState<PilotProfileStatus | "all">(
    "pending_review",
  );
  const [pilots, setPilots] = useState<AdminPilotDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actingId, setActingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/pilots?status=${filter}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to load pilots.");
        setPilots([]);
      } else {
        setPilots(data.pilots ?? []);
      }
    } catch {
      setError("Failed to load pilots.");
      setPilots([]);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    void load();
  }, [load]);

  async function moderate(id: string, action: "approve" | "reject") {
    setActingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/pilots/${id}/${action}`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Action failed.");
      } else {
        await load();
      }
    } catch {
      setError("Action failed.");
    } finally {
      setActingId(null);
    }
  }

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
        <Button type="button" variant="ghost" size="sm" onClick={() => void load()}>
          Refresh
        </Button>
      </div>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading pilots…</p>
      ) : pilots.length === 0 ? (
        <p className="empty-state">
          No pilots in this queue.
        </p>
      ) : (
        <ul className="list-panel">
          {pilots.map((p) => (
            <li
              key={p.id}
              className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium">{p.displayName}</p>
                <p className="text-sm text-muted-foreground">{p.email}</p>
                <p className="text-xs text-muted-foreground">
                  {p.locationCity ?? "—"}
                  {p.locationRegion ? `, ${p.locationRegion}` : ""} · License{" "}
                  {p.licenseNumber}
                  {p.isPublic ? " · Public" : ""}
                </p>
                {p.membershipTierName ? (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {p.membershipTierName} ({p.membershipTierCode}) ·{" "}
                    {p.membershipStatus} · visibility{" "}
                    {p.jobVisibilityDelayHours === 0
                      ? "immediate"
                      : `${p.jobVisibilityDelayHours}h`}{" "}
                    · {p.canApply ? "can bid" : "view only"}
                    {p.instructorEligible ? " · instructor" : ""}
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-muted-foreground">
                    No active membership tier
                  </p>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <PilotStatusBadge status={p.status} />
                {p.status === "approved" ? (
                  <Link
                    href={`/pilots/${p.id}`}
                    className="text-sm text-gold-dark hover:text-gold"
                  >
                    Public profile
                  </Link>
                ) : null}
                {p.status === "pending_review" ? (
                  <>
                    <Button
                      type="button"
                      size="sm"
                      disabled={actingId === p.id}
                      onClick={() => void moderate(p.id, "approve")}
                    >
                      Approve
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      disabled={actingId === p.id}
                      onClick={() => void moderate(p.id, "reject")}
                    >
                      Reject
                    </Button>
                  </>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
