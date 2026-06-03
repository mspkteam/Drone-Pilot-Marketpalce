"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { WingBadge } from "@/components/wings/WingBadge";
import { getWingCategoryLabel } from "@/lib/wings/status";
import type { PilotWingDto } from "@/types/wing";

export function PilotWingsPanel() {
  const [wings, setWings] = useState<PilotWingDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/pilot/wings");
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to load wings.");
        setWings([]);
      } else {
        setWings(data.wings ?? []);
      }
    } catch {
      setError("Failed to load wings.");
      setWings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading wings…</p>;
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Digital Wings are earned automatically from bookings, reviews,
        verifications, and certificates — or awarded manually by admins.
      </p>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      {wings.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-8 text-center">
          <p className="text-sm text-muted-foreground">
            No wings earned yet. Complete bookings and build trust to unlock
            milestones.
          </p>
          <ul className="mt-4 flex flex-wrap justify-center gap-3 text-sm">
            <li>
              <Link
                href="/dashboard/pilot/bookings"
                className="text-gold-dark hover:underline"
              >
                My bookings
              </Link>
            </li>
            <li>
              <Link
                href="/dashboard/pilot/verifications"
                className="text-gold-dark hover:underline"
              >
                Verifications
              </Link>
            </li>
          </ul>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {wings.map((wing) => (
            <li
              key={wing.id}
              className="rounded-lg border border-border bg-surface-elevated p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <WingBadge
                  title={wing.title}
                  iconLabel={wing.iconLabel}
                  category={wing.category}
                  size="md"
                />
                <span className="text-xs text-muted-foreground capitalize">
                  {wing.source === "auto" ? "Auto" : "Awarded"}
                </span>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                {wing.description}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                {getWingCategoryLabel(wing.category)} · Earned{" "}
                {new Date(wing.earnedAt).toLocaleDateString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
