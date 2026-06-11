"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  formatBubbleTime,
  formatConversationTime,
} from "@/lib/client/client-messages-utils";
import type {
  AdminConversationDetail,
  AdminConversationRow,
  AdminMessagesDateFilter,
  AdminMessagesScopeFilter,
} from "@/types/admin-messages";

const LIST_API = "/api/admin/conversations" as const;

type AdminMessagesTrackingProps = {
  initialConversationId?: string;
};

function isClientRole(role: string): boolean {
  return role === "client";
}

function matchesDateFilter(
  iso: string | null,
  filter: AdminMessagesDateFilter,
): boolean {
  if (filter === "all" || !iso) return true;

  const date = new Date(iso);
  const now = Date.now();
  const days =
    filter === "7d" ? 7 : filter === "30d" ? 30 : 90;
  const cutoff = now - days * 24 * 60 * 60 * 1000;
  return date.getTime() >= cutoff;
}

export function AdminMessagesTracking({
  initialConversationId,
}: AdminMessagesTrackingProps) {
  const [conversations, setConversations] = useState<AdminConversationRow[]>(
    [],
  );
  const [loadingList, setLoadingList] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(
    initialConversationId ?? null,
  );
  const [mobileTranscriptOpen, setMobileTranscriptOpen] = useState(
    !!initialConversationId,
  );
  const [detail, setDetail] = useState<AdminConversationDetail | null>(null);
  const [loadingThread, setLoadingThread] = useState(false);
  const [threadError, setThreadError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [scopeFilter, setScopeFilter] =
    useState<AdminMessagesScopeFilter>("all");
  const [jobFilter, setJobFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState<AdminMessagesDateFilter>("all");

  const loadList = useCallback(async () => {
    setLoadingList(true);
    setListError(null);
    try {
      const res = await fetch(LIST_API);
      const data = await res.json();
      if (!res.ok) {
        setListError(data.error ?? "Failed to load conversations.");
        setConversations([]);
        return;
      }
      setConversations((data.conversations ?? []) as AdminConversationRow[]);
    } catch {
      setListError("Failed to load conversations.");
      setConversations([]);
    } finally {
      setLoadingList(false);
    }
  }, []);

  const loadThread = useCallback(async (conversationId: string) => {
    setLoadingThread(true);
    setThreadError(null);
    try {
      const res = await fetch(`/api/admin/conversations/${conversationId}`);
      const data = await res.json();
      if (!res.ok) {
        setThreadError(data.error ?? "Failed to load conversation.");
        setDetail(null);
        return;
      }
      setDetail(data.conversation as AdminConversationDetail);
    } catch {
      setThreadError("Failed to load conversation.");
      setDetail(null);
    } finally {
      setLoadingThread(false);
    }
  }, []);

  useEffect(() => {
    void loadList();
  }, [loadList]);

  useEffect(() => {
    if (selectedId) return;
    if (conversations[0]) {
      setSelectedId(conversations[0].id);
    }
  }, [conversations, selectedId]);

  useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      return;
    }
    void loadThread(selectedId);
  }, [selectedId, loadThread]);

  const jobOptions = useMemo(() => {
    const titles = new Set(conversations.map((c) => c.jobTitle));
    return ["all", ...Array.from(titles).sort((a, b) => a.localeCompare(b))];
  }, [conversations]);

  const filteredConversations = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return conversations.filter((conversation) => {
      if (jobFilter !== "all" && conversation.jobTitle !== jobFilter) {
        return false;
      }

      if (!matchesDateFilter(conversation.lastMessageAt, dateFilter)) {
        return false;
      }

      if (!query) return true;

      const haystacks: Record<AdminMessagesScopeFilter, string[]> = {
        all: [
          conversation.jobTitle,
          conversation.clientName,
          conversation.pilotName,
          conversation.lastMessagePreview ?? "",
        ],
        client: [conversation.clientName, conversation.lastMessagePreview ?? ""],
        pilot: [conversation.pilotName, conversation.lastMessagePreview ?? ""],
        job: [conversation.jobTitle],
      };

      return haystacks[scopeFilter].some((value) =>
        value.toLowerCase().includes(query),
      );
    });
  }, [conversations, dateFilter, jobFilter, scopeFilter, searchQuery]);

  const hasActiveFilters =
    searchQuery.trim().length > 0 ||
    scopeFilter !== "all" ||
    jobFilter !== "all" ||
    dateFilter !== "all";

  function clearFilters() {
    setSearchQuery("");
    setScopeFilter("all");
    setJobFilter("all");
    setDateFilter("all");
  }

  async function handleRefresh() {
    setRefreshing(true);
    await loadList();
    if (selectedId) {
      await loadThread(selectedId);
    }
    setRefreshing(false);
  }

  function selectConversation(id: string) {
    setSelectedId(id);
    setMobileTranscriptOpen(true);
  }

  const selectedListItem = conversations.find((c) => c.id === selectedId);

  return (
    <div className="admin-messages-page">
      <section
        className="admin-messages-hero admin-ops-bracket-card"
        aria-label="Messages"
      >
        <div className="admin-ops-hero-glow" aria-hidden />
        <div className="admin-messages-hero-copy">
          <p className="admin-ops-eyebrow">COMMUNICATIONS</p>
          <h1 className="admin-messages-hero-title">Messages</h1>
          <p className="admin-messages-hero-desc">
            Read-only view of client–pilot conversations for support and
            dispute review.
          </p>
          <p className="admin-messages-hero-note">
            Admins and moderators can view conversation history only. They
            cannot send messages from this screen.
          </p>
        </div>
        <div className="admin-messages-hero-actions">
          <button
            type="button"
            className="admin-messages-refresh-btn"
            onClick={() => void handleRefresh()}
            disabled={refreshing || loadingList}
          >
            Refresh
          </button>
        </div>
      </section>

      <div
        className={`admin-messages-inbox${
          mobileTranscriptOpen ? " admin-messages-inbox--transcript-open" : ""
        }`}
      >
        <aside className="admin-messages-list-panel" aria-label="Conversations">
          <div className="admin-messages-list-head">
            <h2 className="admin-messages-list-title">Conversation Tracking</h2>
          </div>

          <div className="admin-messages-filters">
            <input
              type="search"
              className="admin-messages-search"
              placeholder="Search conversations, clients, pilots, jobs..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              aria-label="Search conversations"
            />
            <div className="admin-messages-filter-row">
              <select
                className="admin-messages-select"
                value={scopeFilter}
                onChange={(event) =>
                  setScopeFilter(event.target.value as AdminMessagesScopeFilter)
                }
                aria-label="Search scope"
              >
                <option value="all">All conversations</option>
                <option value="client">Client</option>
                <option value="pilot">Pilot</option>
                <option value="job">Job / Project</option>
              </select>
              <select
                className="admin-messages-select"
                value={jobFilter}
                onChange={(event) => setJobFilter(event.target.value)}
                aria-label="Filter by job"
              >
                <option value="all">All jobs</option>
                {jobOptions
                  .filter((title) => title !== "all")
                  .map((title) => (
                    <option key={title} value={title}>
                      {title}
                    </option>
                  ))}
              </select>
              <select
                className="admin-messages-select"
                value={dateFilter}
                onChange={(event) =>
                  setDateFilter(event.target.value as AdminMessagesDateFilter)
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
                  className="admin-messages-clear-btn"
                  onClick={clearFilters}
                >
                  Clear filters
                </button>
              ) : null}
            </div>
          </div>

          {listError ? (
            <p className="admin-messages-list-error" role="alert">
              {listError}
            </p>
          ) : null}

          <div className="admin-messages-list-scroll">
            {loadingList ? (
              <p className="admin-messages-list-status">Loading…</p>
            ) : filteredConversations.length === 0 ? (
              <p className="admin-messages-list-status">
                {conversations.length === 0
                  ? "No conversations yet."
                  : "No conversations match these filters."}
              </p>
            ) : (
              filteredConversations.map((conversation) => (
                <button
                  key={conversation.id}
                  type="button"
                  className={`admin-messages-list-item${
                    selectedId === conversation.id
                      ? " admin-messages-list-item--active"
                      : ""
                  }`}
                  onClick={() => selectConversation(conversation.id)}
                >
                  <div className="admin-messages-list-row">
                    <span className="admin-messages-list-job">
                      {conversation.jobTitle}
                    </span>
                    {conversation.lastMessageAt ? (
                      <span className="admin-messages-list-time">
                        {formatConversationTime(conversation.lastMessageAt)}
                      </span>
                    ) : null}
                  </div>
                  <span className="admin-messages-list-participants">
                    {conversation.clientName} ↔ {conversation.pilotName}
                  </span>
                  {conversation.lastMessagePreview ? (
                    <span className="admin-messages-list-preview">
                      {conversation.lastMessagePreview}
                    </span>
                  ) : null}
                </button>
              ))
            )}
          </div>
        </aside>

        <section
          className="admin-messages-transcript-panel"
          aria-label="Conversation transcript"
        >
          {!selectedId ? (
            <div className="admin-messages-thread">
              <p className="admin-messages-thread-status">
                Select a conversation to view its read-only history.
              </p>
            </div>
          ) : (
            <>
              <header className="admin-messages-transcript-head">
                <div className="admin-messages-transcript-head-main">
                  <button
                    type="button"
                    className="admin-messages-back-btn"
                    onClick={() => setMobileTranscriptOpen(false)}
                  >
                    ← Back to list
                  </button>
                  <h2 className="admin-messages-transcript-title">
                    {detail?.jobTitle ?? selectedListItem?.jobTitle ?? "Conversation"}
                  </h2>
                  <p className="admin-messages-transcript-meta">
                    <strong>Client:</strong>{" "}
                    {detail?.clientName ?? selectedListItem?.clientName ?? "—"}
                    <br />
                    <strong>Pilot:</strong>{" "}
                    {detail?.pilotName ?? selectedListItem?.pilotName ?? "—"}
                    {detail?.jobTitle || selectedListItem?.jobTitle ? (
                      <>
                        <br />
                        <strong>Project:</strong>{" "}
                        {detail?.jobTitle ?? selectedListItem?.jobTitle}
                      </>
                    ) : null}
                  </p>
                </div>
                <span className="admin-messages-readonly-badge">Read only</span>
              </header>

              <div className="admin-messages-thread">
                {loadingThread ? (
                  <p className="admin-messages-thread-status">Loading…</p>
                ) : threadError ? (
                  <p className="admin-messages-thread-error" role="alert">
                    {threadError}
                  </p>
                ) : !detail || detail.messages.length === 0 ? (
                  <p className="admin-messages-thread-status">
                    No messages found for this conversation.
                  </p>
                ) : (
                  detail.messages.map((message) => {
                    const isClient = isClientRole(message.senderRole);
                    return (
                      <div
                        key={message.id}
                        className={`admin-messages-bubble-wrap${
                          isClient ? "" : " admin-messages-bubble-wrap--pilot"
                        }`}
                      >
                        <div
                          className={`admin-messages-bubble${
                            isClient ? "" : " admin-messages-bubble--pilot"
                          }`}
                        >
                          <p
                            className={`admin-messages-bubble-sender${
                              isClient
                                ? ""
                                : " admin-messages-bubble-sender--pilot"
                            }`}
                          >
                            {isClient ? "Client" : "Pilot"} ·{" "}
                            {message.senderEmail}
                          </p>
                          <p className="admin-messages-bubble-body">
                            {message.body}
                          </p>
                          <span className="admin-messages-bubble-time">
                            {formatBubbleTime(message.createdAt)}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
