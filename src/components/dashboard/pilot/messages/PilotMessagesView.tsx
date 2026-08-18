"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  formatBubbleTime,
  formatConversationTime,
  initialsFromName,
} from "@/lib/client/client-messages-utils";
import { formatContractId } from "@/lib/pilot/active-contracts-map";
import type {
  ConversationDetailDto,
  ConversationListItemDto,
  MessageDto,
} from "@/types/messaging";
import {
  PaperclipIcon,
  SendIcon,
} from "@/components/dashboard/client/messages/ClientMessagesIcons";

const LIST_API = "/api/pilot/conversations" as const;
const API_BASE = "/api/pilot/conversations" as const;

type PilotMessagesViewProps = {
  initialConversationId?: string;
};

type ThreadMessage = {
  id: string;
  body: string;
  timeLabel: string;
  isMine: boolean;
};

export function PilotMessagesView({
  initialConversationId,
}: PilotMessagesViewProps) {
  const [conversations, setConversations] = useState<ConversationListItemDto[]>(
    [],
  );
  const [loadingList, setLoadingList] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(
    initialConversationId ?? null,
  );
  const [mobileChatOpen, setMobileChatOpen] = useState(!!initialConversationId);
  const [detail, setDetail] = useState<ConversationDetailDto | null>(null);
  const [loadingThread, setLoadingThread] = useState(false);
  const [threadError, setThreadError] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);

  const loadList = useCallback(async () => {
    setLoadingList(true);
    setListError(null);
    try {
      const res = await fetch(LIST_API);
      const data = await res.json();
      if (!res.ok) {
        setListError(data.error ?? "Failed to load messages.");
        setConversations([]);
        return;
      }

      setConversations((data.conversations ?? []) as ConversationListItemDto[]);
    } catch {
      setListError("Failed to load messages.");
      setConversations([]);
    } finally {
      setLoadingList(false);
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
      setLoadingThread(false);
      return;
    }

    let cancelled = false;

    async function loadThread() {
      setLoadingThread(true);
      setThreadError(null);
      try {
        const res = await fetch(`${API_BASE}/${selectedId}`);
        const data = await res.json();
        if (cancelled) return;

        if (!res.ok) {
          setThreadError(data.error ?? "Failed to load conversation.");
          setDetail(null);
        } else {
          setDetail(data.conversation as ConversationDetailDto);
          setConversations((current) =>
            current.map((item) =>
              item.id === selectedId ? { ...item, unreadCount: 0 } : item,
            ),
          );
        }
      } catch {
        if (!cancelled) {
          setThreadError("Failed to load conversation.");
          setDetail(null);
        }
      } finally {
        if (!cancelled) setLoadingThread(false);
      }
    }

    void loadThread();
    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  const selectedApi = useMemo(
    () => conversations.find((c) => c.id === selectedId) ?? null,
    [conversations, selectedId],
  );

  const headerName = selectedApi?.counterpartName ?? "Messages";
  const headerInitials = initialsFromName(headerName);
  const headerContext = selectedApi
    ? `RE: ${selectedApi.jobTitle} · ${selectedApi.bookingId ? formatContractId(selectedApi.bookingId) : "Pending contract"}`
    : null;

  const threadMessages: ThreadMessage[] = useMemo(() => {
    if (!detail) return [];
    return detail.messages.map((m: MessageDto) => ({
      id: m.id,
      body: m.body,
      timeLabel: formatBubbleTime(m.createdAt),
      isMine: m.isMine,
    }));
  }, [detail]);

  function selectConversation(id: string) {
    setSelectedId(id);
    setMobileChatOpen(true);
    setDraft("");
    setThreadError(null);
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const text = draft.trim();
    if (!text || !selectedId) return;

    setSending(true);
    setThreadError(null);
    try {
      const res = await fetch(`${API_BASE}/${selectedId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: text }),
      });
      const data = await res.json();
      if (!res.ok) {
        setThreadError(data.error ?? "Failed to send message.");
      } else {
        const newMsg = data.message as MessageDto;
        setDraft("");
        setDetail((prev) =>
          prev
            ? {
                ...prev,
                messages: [...prev.messages, newMsg],
                lastMessagePreview: newMsg.body,
                lastMessageAt: newMsg.createdAt,
              }
            : prev,
        );
        setConversations((current) =>
          current.map((item) =>
            item.id === selectedId
              ? {
                  ...item,
                  lastMessagePreview: newMsg.body,
                  lastMessageAt: newMsg.createdAt,
                }
              : item,
          ),
        );
      }
    } catch {
      setThreadError("Failed to send message.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="pilot-messages-page">
      <header className="pilot-messages-header pilot-messages-bracket-card">
        <p className="pilot-messages-eyebrow">OPERATIONS / MESSAGES</p>
        <h1 className="pilot-messages-title">Messages</h1>
      </header>

      <div className="pilot-messages-panel">
        <div
          className={`client-messages-layout${mobileChatOpen ? " client-messages-layout--chat-open" : ""}`}
        >
      <aside className="client-messages-list">
        <h2 className="client-messages-list-title">Conversations</h2>

        {listError ? (
          <p className="client-messages-list-error" role="alert">
            {listError}
          </p>
        ) : null}

        <div className="client-messages-list-scroll">
          {loadingList ? (
            <p className="client-messages-list-status">Loading conversations…</p>
          ) : conversations.length === 0 ? (
            <p className="client-messages-list-status">No conversations yet.</p>
          ) : (
            conversations.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`client-messages-list-item${selectedId === item.id ? " client-messages-list-item--active" : ""}`}
                onClick={() => selectConversation(item.id)}
              >
                <span className="client-messages-avatar" aria-hidden>
                  {initialsFromName(item.counterpartName)}
                </span>
                <span className="client-messages-list-copy">
                  <span className="client-messages-list-row">
                    <span className="client-messages-list-name">
                      {item.counterpartName}
                    </span>
                    <span className="client-messages-list-time">
                      {formatConversationTime(item.lastMessageAt)}
                    </span>
                  </span>
                  <span className="client-messages-list-preview">
                    {item.lastMessagePreview ?? item.jobTitle}
                  </span>
                </span>
                {item.unreadCount > 0 ? (
                  <span className="client-messages-unread">{item.unreadCount}</span>
                ) : null}
              </button>
            ))
          )}
        </div>
      </aside>

      <section className="client-messages-chat">
        <header className="client-messages-chat-header">
          <button
            type="button"
            className="client-messages-back-btn"
            onClick={() => setMobileChatOpen(false)}
          >
            ← Conversations
          </button>

          <div className="client-messages-chat-header-main">
            <span className="client-messages-avatar client-messages-avatar--header" aria-hidden>
              {headerInitials}
            </span>
            <div>
              <p className="client-messages-chat-name">{headerName}</p>
              {headerContext ? (
                <p className="pilot-messages-chat-context">{headerContext}</p>
              ) : (
                <p className="client-messages-chat-status">Client</p>
              )}
            </div>
          </div>
        </header>

        <div className="client-messages-thread">
          {!selectedId ? (
            <p className="client-messages-thread-status">
              Select a conversation to view messages.
            </p>
          ) : loadingThread ? (
            <p className="client-messages-thread-status">Loading messages…</p>
          ) : threadError ? (
            <p className="client-messages-thread-error" role="alert">
              {threadError}
            </p>
          ) : threadMessages.length === 0 ? (
            <p className="client-messages-thread-status">
              No messages yet. Say hello to get started.
            </p>
          ) : (
            threadMessages.map((message) => (
              <div
                key={message.id}
                className={`client-messages-bubble-wrap${message.isMine ? " client-messages-bubble-wrap--mine" : ""}`}
              >
                <div
                  className={`client-messages-bubble${message.isMine ? " client-messages-bubble--mine" : ""}`}
                >
                  <p>{message.body}</p>
                  <span className="client-messages-bubble-time">
                    {message.timeLabel}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        <form className="client-messages-composer" onSubmit={(e) => void handleSend(e)}>
          <div className="client-messages-input-wrap">
            <input
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Type your message..."
              className="client-messages-input"
              disabled={!selectedId || sending}
            />
            <button
              type="button"
              className="client-messages-attach-btn"
              disabled
              title="File attachments pending implementation"
              aria-label="Attach file (coming soon)"
            >
              <PaperclipIcon />
            </button>
          </div>
          <button
            type="submit"
            className="client-messages-send-btn"
            disabled={!selectedId || sending || !draft.trim()}
          >
            <SendIcon />
            {sending ? "Sending…" : "Send"}
          </button>
        </form>
      </section>
        </div>
      </div>
    </div>
  );
}
