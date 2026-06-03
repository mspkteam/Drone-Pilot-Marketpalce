"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import type { AdminClientDto } from "@/types/admin";

export function AdminClientsPanel() {
  const [clients, setClients] = useState<AdminClientDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        <p className="text-sm text-muted-foreground">Loading clients…</p>
      ) : clients.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No clients found.
        </p>
      ) : (
        <ul className="divide-y divide-border rounded-lg border border-border">
          {clients.map((c) => (
            <li key={c.id} className="p-4">
              <p className="font-medium">{c.contactName}</p>
              <p className="text-sm text-muted-foreground">
                {c.email}
                {c.companyName ? ` · ${c.companyName}` : ""}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {c.jobCount} job{c.jobCount === 1 ? "" : "s"} · Status {c.status}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
