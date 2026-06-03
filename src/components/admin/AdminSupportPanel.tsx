"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import type { AdminSupportChatListItemDto, SupportChatStatus } from "@/types/support";
import { SUPPORT_CHAT_STATUSES } from "@/types/support";
const STATUS_LABELS: Record<SupportChatStatus, string> = {
  open: "Open",
  pending: "In progress",
  resolved: "Resolved",
  closed: "Closed",
};

const FILTER_LABELS: Record<SupportChatStatus | "all", string> = {
  all: "All chats",
  open: "Open",
  pending: "In progress",
  resolved: "Resolved",
  closed: "Closed",
};

export function AdminSupportPanel({ readOnly }: { readOnly: boolean }) {
  const [filter, setFilter] = useState<SupportChatStatus | "all">("all");
  const [chats, setChats] = useState<AdminSupportChatListItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/admin/support/chats?status=${filter}`,
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to load.");
        setChats([]);
      } else {
        setChats(data.chats ?? []);
      }
    } catch {
      setError("Failed to load support chats.");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-6">
      {readOnly ? (
        <p className="rounded-lg border border-border bg-surface-elevated px-4 py-3 text-sm text-muted-foreground">
          Read-only view — moderators cannot reply or change status.
        </p>
      ) : null}

      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-medium">Filter by status</p>
          <Button type="button" variant="ghost" size="sm" onClick={() => void load()}>
            Refresh list
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {(["all", ...SUPPORT_CHAT_STATUSES] as const).map((s) => (
            <Button
              key={s}
              type="button"
              variant={filter === s ? "primary" : "outline"}
              size="sm"
              onClick={() => setFilter(s)}
            >
              {FILTER_LABELS[s]}
            </Button>
          ))}
        </div>
      </div>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : chats.length === 0 ? (
        <p className="empty-state">
          No support chats in this filter.
        </p>
      ) : (
        <ul className="list-panel">
          {chats.map((c) => (
            <li key={c.id}>
              <Link
                href={`/dashboard/admin/support/${c.id}`}
                className="list-panel-row"
              >
                <div>
                  <p className="font-medium">
                    {c.requesterName}
                    {c.unreadForAdmin ? (
                      <span className="ml-2 inline-flex h-2 w-2 rounded-full bg-gold" />
                    ) : null}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {c.requesterEmail} · {c.requesterRole}
                  </p>
                  <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                    {c.lastMessagePreview}
                  </p>
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  <span className="rounded-full border border-border px-2 py-0.5">
                    {STATUS_LABELS[c.status]}
                  </span>
                  <p className="mt-1">
                    {new Date(c.lastMessageAt).toLocaleString()}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
