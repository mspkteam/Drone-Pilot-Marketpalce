"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { formatSupportTicketId } from "@/components/support/support-chat-ui";
import type {
  AdminSupportChatListItemDto,
  SupportChatStatus,
  SupportRequesterRole,
} from "@/types/support";
import { SUPPORT_CHAT_STATUSES } from "@/types/support";

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

type AdminSupportPanelProps = {
  readOnly: boolean;
  embedded?: boolean;
  selectedChatId?: string | null;
  onSelectChat?: (id: string) => void;
  onRegisterRefresh?: (refresh: () => Promise<void>) => void;
};

type DateFilter = "all" | "7d" | "30d" | "90d";

function matchesDateFilter(iso: string, filter: DateFilter): boolean {
  if (filter === "all") return true;
  const days = filter === "7d" ? 7 : filter === "30d" ? 30 : 90;
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return new Date(iso).getTime() >= cutoff;
}

export function AdminSupportPanel({
  readOnly,
  embedded = false,
  selectedChatId = null,
  onSelectChat,
  onRegisterRefresh,
}: AdminSupportPanelProps) {
  const [filter, setFilter] = useState<SupportChatStatus | "all">("all");
  const [chats, setChats] = useState<AdminSupportChatListItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<SupportRequesterRole | "all">(
    "all",
  );
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/support/chats?status=${filter}`);
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

  useEffect(() => {
    onRegisterRefresh?.(load);
  }, [load, onRegisterRefresh]);

  useEffect(() => {
    if (!embedded || selectedChatId || chats.length === 0) return;
    onSelectChat?.(chats[0]!.id);
  }, [chats, embedded, onSelectChat, selectedChatId]);

  const filteredChats = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return chats.filter((chat) => {
      if (roleFilter !== "all" && chat.requesterRole !== roleFilter) {
        return false;
      }

      if (!matchesDateFilter(chat.lastMessageAt, dateFilter)) {
        return false;
      }

      if (!query) return true;

      const ticketId = formatSupportTicketId(chat.id).toLowerCase();
      const haystack = [
        chat.requesterName,
        chat.requesterEmail,
        chat.initialMessage,
        chat.lastMessagePreview,
        ticketId,
        chat.id,
      ];

      return haystack.some((value) => value.toLowerCase().includes(query));
    });
  }, [chats, dateFilter, roleFilter, searchQuery]);

  const hasActiveFilters =
    searchQuery.trim().length > 0 ||
    roleFilter !== "all" ||
    dateFilter !== "all";

  function clearFilters() {
    setSearchQuery("");
    setRoleFilter("all");
    setDateFilter("all");
  }

  const listContent = (
    <>
      {error ? (
        <p className="admin-support-list-error" role="alert">
          {error}
        </p>
      ) : null}

      <div className="admin-support-list-scroll">
        {loading ? (
          <p className="admin-support-list-status">Loading…</p>
        ) : filteredChats.length === 0 ? (
          <p className="admin-support-list-status">
            {chats.length === 0
              ? "No support chats in this filter."
              : "No conversations match these filters."}
          </p>
        ) : (
          filteredChats.map((chat) => {
            const itemClass = `admin-support-list-item${
              selectedChatId === chat.id
                ? " admin-support-list-item--active"
                : ""
            }`;

            const body = (
              <>
                <div className="admin-support-list-row">
                  <span className="admin-support-list-name">
                    {chat.requesterName}
                    {chat.unreadForAdmin ? (
                      <span
                        className="admin-support-unread-dot"
                        aria-label="Unread"
                      />
                    ) : null}
                  </span>
                  <span className="admin-support-list-time">
                    {new Date(chat.lastMessageAt).toLocaleString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <span className="admin-support-list-meta">
                  {chat.requesterEmail} ·{" "}
                  {REQUESTER_ROLE_LABELS[chat.requesterRole]}
                </span>
                <span className="admin-support-list-ticket">
                  #{formatSupportTicketId(chat.id)}
                </span>
                <span className="admin-support-list-preview">
                  <span className="admin-support-list-preview-label">
                    Initial:{" "}
                  </span>
                  {chat.initialMessage}
                </span>
                <span className="admin-support-list-preview">
                  Latest: {chat.lastMessagePreview}
                  {chat.hasAttachment ? (
                    <span className="admin-support-list-preview--attachment">
                      {" "}
                      · Has attachment
                    </span>
                  ) : null}
                </span>
                <span
                  className={`admin-support-list-status-badge admin-support-list-status-badge--${chat.status}`}
                >
                  {STATUS_LABELS[chat.status]}
                </span>
              </>
            );

            if (embedded) {
              return (
                <button
                  key={chat.id}
                  type="button"
                  className={itemClass}
                  onClick={() => onSelectChat?.(chat.id)}
                >
                  {body}
                </button>
              );
            }

            return (
              <Link
                key={chat.id}
                href={`/dashboard/admin/support/${chat.id}`}
                className={itemClass}
              >
                {body}
              </Link>
            );
          })
        )}
      </div>
    </>
  );

  if (!embedded) {
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
            <button
              type="button"
              className="text-sm text-gold"
              onClick={() => void load()}
            >
              Refresh list
            </button>
          </div>
          <div className="dashboard-filter-bar">
            {(["all", ...SUPPORT_CHAT_STATUSES] as const).map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setFilter(status)}
                className={`filter-pill${filter === status ? " filter-pill-active" : ""}`}
              >
                {FILTER_LABELS[status]}
              </button>
            ))}
          </div>
        </div>
        {listContent}
      </div>
    );
  }

  return (
    <aside className="admin-support-list-panel" aria-label="Support chats">
      <div className="admin-support-toolbar">
        <div className="admin-support-toolbar-top">
          <h2 className="admin-support-list-title">Support Requests</h2>
        </div>

        <div className="admin-support-filters">
          <input
            type="search"
            className="admin-support-search"
            placeholder="Search users, emails, ticket IDs..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            aria-label="Search support chats"
          />
          <div className="admin-support-filter-row">
            <select
              className="admin-support-select"
              value={roleFilter}
              onChange={(event) =>
                setRoleFilter(event.target.value as SupportRequesterRole | "all")
              }
              aria-label="Filter by role"
            >
              <option value="all">All roles</option>
              <option value="guest">Guest</option>
              <option value="client">Client</option>
              <option value="pilot">Pilot</option>
              <option value="admin">Admin</option>
            </select>
            <select
              className="admin-support-select"
              value={dateFilter}
              onChange={(event) =>
                setDateFilter(event.target.value as DateFilter)
              }
              aria-label="Filter by date"
            >
              <option value="all">All dates</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
            {hasActiveFilters ? (
              <button
                type="button"
                className="admin-support-clear-btn"
                onClick={clearFilters}
              >
                Clear
              </button>
            ) : null}
          </div>
        </div>

        <div
          className="admin-support-status-pills"
          role="tablist"
          aria-label="Filter by chat status"
        >
          {(["all", ...SUPPORT_CHAT_STATUSES] as const).map((status) => (
            <button
              key={status}
              type="button"
              role="tab"
              aria-selected={filter === status}
              className={`admin-support-status-pill${
                filter === status ? " admin-support-status-pill--active" : ""
              }`}
              onClick={() => setFilter(status)}
            >
              {FILTER_LABELS[status]}
            </button>
          ))}
        </div>
      </div>

      {listContent}
    </aside>
  );
}
