"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import type { AdminClientDto } from "@/types/admin";
import { cn } from "@/lib/utils";

type ClientFilter = "needs_approval" | "all" | "active" | "suspended";

const FILTERS: Array<{ value: ClientFilter; label: string }> = [
  { value: "needs_approval", label: "Needs approval" },
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "suspended", label: "Suspended" },
];

function needsApproval(status: string): boolean {
  return status === "draft" || status === "pending_review";
}

export function AdminClientsPanel() {
  const [clients, setClients] = useState<AdminClientDto[]>([]);
  const [filter, setFilter] = useState<ClientFilter>("needs_approval");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actingId, setActingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/clients");
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to load clients.");
        setClients([]);
      } else {
        setClients(data.clients ?? []);
      }
    } catch {
      setError("Failed to load clients.");
      setClients([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const visible = useMemo(() => {
    if (filter === "all") return clients;
    if (filter === "needs_approval") {
      return clients.filter((c) => needsApproval(c.status));
    }
    return clients.filter((c) => c.status === filter);
  }, [clients, filter]);

  async function approveClient(client: AdminClientDto) {
    setActingId(client.id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${client.userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client: { status: "active" },
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Approve failed.");
        return;
      }
      await load();
    } catch {
      setError("Approve failed.");
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
              "filter-pill",
              filter === f.value && "filter-pill-active",
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
        <p className="text-sm text-muted-foreground">Loading clients…</p>
      ) : visible.length === 0 ? (
        <p className="empty-state">No clients in this queue.</p>
      ) : (
        <ul className="list-panel">
          {visible.map((c) => (
            <li
              key={c.id}
              className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium">{c.contactName}</p>
                <p className="text-sm text-muted-foreground">
                  {c.email}
                  {c.companyName ? ` · ${c.companyName}` : ""}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {c.jobCount} job{c.jobCount === 1 ? "" : "s"} · Status{" "}
                  {c.status}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/dashboard/admin/users/${c.userId}?from=clients`}
                  className="text-sm text-gold-dark hover:text-gold"
                >
                  View profile
                </Link>
                {needsApproval(c.status) ? (
                  <Button
                    type="button"
                    size="sm"
                    disabled={actingId === c.id}
                    onClick={() => void approveClient(c)}
                  >
                    {actingId === c.id ? "Approving…" : "Approve profile"}
                  </Button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
