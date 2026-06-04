"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { formatSupportTicketId } from "@/components/support/support-chat-ui";
import type {
  AdminSupportChatListItemDto,
  SupportChatStatus,
  SupportRequesterRole,
} from "@/types/support";
import { SUPPORT_CHAT_STATUSES } from "@/types/support";
import { cn } from "@/lib/utils";

const STATUS_LABELS: Record<SupportChatStatus, string> = {
  open: "Open",
  pending: "Pending",
  resolved: "Resolved",
  closed: "Closed",
};

const REQUESTER_ROLE_LABELS: Record<SupportRequesterRole, string> = {
  guest: "Guest",
  client: "Client",
  pilot: "Pilot",
  admin: "Admin",
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
        <div className="dashboard-filter-bar">
          {(["all", ...SUPPORT_CHAT_STATUSES] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setFilter(s)}
              className={cn(
                "filter-pill",
                filter === s && "filter-pill-active",
              )}
            >
              {FILTER_LABELS[s]}
            </button>
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
                <div className="min-w-0 flex-1">
                  <p className="font-medium">
                    {c.requesterName}
                    {c.unreadForAdmin ? (
                      <span
                        className="ml-2 inline-flex h-2 w-2 rounded-full bg-gold"
                        aria-label="Unread"
                      />
                    ) : null}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {c.requesterEmail} ·{" "}
                    {REQUESTER_ROLE_LABELS[c.requesterRole]}
                  </p>
                  <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                    #{formatSupportTicketId(c.id)}
                  </p>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                    <span className="text-foreground/80">Initial: </span>
                    {c.initialMessage}
                  </p>
                  <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                    Latest: {c.lastMessagePreview}
                    {c.hasAttachment ? (
                      <span className="ml-2 text-gold-light">· Has attachment</span>
                    ) : null}
                  </p>
                </div>
                <div className="shrink-0 text-right text-xs text-muted-foreground">
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
