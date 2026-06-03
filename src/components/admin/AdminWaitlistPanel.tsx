"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { getWaitlistRoleLabel } from "@/lib/waitlist/status";
import type { WaitlistEntryDto, WaitlistRoleInterest } from "@/types/waitlist";
import { cn } from "@/lib/utils";

const FILTERS: { value: WaitlistRoleInterest | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pilot", label: "Pilots" },
  { value: "client", label: "Clients" },
  { value: "both", label: "Both" },
];

export function AdminWaitlistPanel() {
  const [filter, setFilter] = useState<WaitlistRoleInterest | "all">("all");
  const [entries, setEntries] = useState<WaitlistEntryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/waitlist?role=${filter}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to load waitlist.");
        setEntries([]);
      } else {
        setEntries(data.entries ?? []);
      }
    } catch {
      setError("Failed to load waitlist.");
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFilter(f.value)}
            className={cn(
              "rounded-full border px-3 py-1 text-sm transition-colors",
              filter === f.value
                ? "border-gold bg-gold/15 text-gold-dark"
                : "border-border hover:border-gold/40",
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
        <p className="text-sm text-muted-foreground">Loading waitlist…</p>
      ) : entries.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No waitlist signups yet.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-border bg-surface text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Interest</th>
                <th className="px-4 py-3 font-medium">Region</th>
                <th className="px-4 py-3 font-medium">Source</th>
                <th className="px-4 py-3 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {entries.map((e) => (
                <tr key={e.id}>
                  <td className="px-4 py-3">{e.email}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {e.name ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    {getWaitlistRoleLabel(e.roleInterest)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {e.region ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {e.source ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(e.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
