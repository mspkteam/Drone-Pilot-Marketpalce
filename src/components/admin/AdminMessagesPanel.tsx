"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";

type AdminConversationRow = {
  id: string;
  jobTitle: string;
  clientName: string;
  pilotName: string;
  lastMessagePreview: string | null;
  lastMessageAt: string | null;
};

export function AdminMessagesPanel() {
  const [conversations, setConversations] = useState<AdminConversationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/conversations");
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to load conversations.");
        setConversations([]);
      } else {
        setConversations(data.conversations ?? []);
      }
    } catch {
      setError("Failed to load conversations.");
      setConversations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Read-only access for support and dispute review. Admins cannot send
        messages.
      </p>
      <Button type="button" variant="ghost" size="sm" onClick={() => void load()}>
        Refresh
      </Button>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : conversations.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No conversations yet.
        </p>
      ) : (
        <ul className="divide-y divide-border rounded-lg border border-border">
          {conversations.map((c) => (
            <li key={c.id}>
              <Link
                href={`/dashboard/admin/messages/${c.id}`}
                className="block p-4 transition-colors hover:bg-surface"
              >
                <p className="font-medium">{c.jobTitle}</p>
                <p className="text-sm text-muted-foreground">
                  {c.clientName} ↔ {c.pilotName}
                </p>
                {c.lastMessagePreview ? (
                  <p className="mt-1 text-sm">{c.lastMessagePreview}</p>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
