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
      <p className="ras-help">
        Read-only access for support and dispute review. Admins cannot send
        messages.
      </p>
      <Button type="button" variant="ghost" size="sm" onClick={() => void load()}>
        Refresh
      </Button>

      {error ? (
        <p className="ras-alert ras-alert--danger" role="alert">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="ras-help">Loading…</p>
      ) : conversations.length === 0 ? (
        <p className="ras-panel ras-muted text-sm">No conversations yet.</p>
      ) : (
        <ul className="ras-panel ras-panel--flush divide-y divide-[var(--color-border-divider)] overflow-hidden">
          {conversations.map((c) => (
            <li key={c.id}>
              <Link
                href={`/dashboard/admin/messages/${c.id}`}
                className="block px-4 py-4 transition-colors hover:bg-[rgba(216,179,57,0.05)]"
              >
                <p className="font-medium text-[var(--color-text)]">{c.jobTitle}</p>
                <p className="ras-muted text-sm">
                  {c.clientName} ↔ {c.pilotName}
                </p>
                {c.lastMessagePreview ? (
                  <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                    {c.lastMessagePreview}
                  </p>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
