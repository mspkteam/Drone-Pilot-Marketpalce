"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CLIENT_MESSAGES_MOCK_CONVERSATIONS,
  type ClientMockConversation,
  type ClientMockMessage,
} from "@/lib/client/client-messages-mock";
import {
  formatBubbleTime,
  formatConversationTime,
  initialsFromName,
} from "@/lib/client/client-messages-utils";
import type {
  ConversationDetailDto,
  ConversationListItemDto,
  EligibleApplicationDto,
  MessageDto,
} from "@/types/messaging";
import { PaperclipIcon, SendIcon } from "./ClientMessagesIcons";

const LIST_API = "/api/client/conversations" as const;
const API_BASE = "/api/client/conversations" as const;

type ClientMessagesViewProps = {
  initialConversationId?: string;
};

type ThreadMessage = {
  id: string;
  body: string;
  timeLabel: string;
  isMine: boolean;
};

function isMockConversationId(id: string): boolean {
  return id.startsWith("mock-conv-");
}

export function ClientMessagesView({
  initialConversationId,
}: ClientMessagesViewProps) {
  const [conversations, setConversations] = useState<ConversationListItemDto[]>(
    [],
  );
  const [eligible, setEligible] = useState<EligibleApplicationDto[]>([]);
  const [mockConversations, setMockConversations] = useState(
    CLIENT_MESSAGES_MOCK_CONVERSATIONS,
  );
  const [useMockFallback, setUseMockFallback] = useState(false);
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
  const [startingId, setStartingId] = useState<string | null>(null);

  const loadList = useCallback(async () => {
    setLoadingList(true);
    setListError(null);
    try {
      const res = await fetch(LIST_API);
      const data = await res.json();
      if (!res.ok) {
        setListError(data.error ?? "Failed to load messages.");
        setConversations([]);
        setEligible([]);
        setUseMockFallback(true);
        return;
      }

      const items = (data.conversations ?? []) as ConversationListItemDto[];
      setConversations(items);
      setEligible((data.eligibleApplications ?? []) as EligibleApplicationDto[]);

      if (items.length === 0) {
        setUseMockFallback(true);
      } else {
        setUseMockFallback(false);
      }
    } catch {
      setListError("Failed to load messages.");
      setConversations([]);
      setEligible([]);
      setUseMockFallback(true);
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    void loadList();
  }, [loadList]);

  useEffect(() => {
    if (selectedId) return;

    if (useMockFallback && mockConversations[0]) {
      setSelectedId(mockConversations[0].id);
      return;
    }

    if (conversations[0]) {
      setSelectedId(conversations[0].id);
    }
  }, [conversations, mockConversations, selectedId, useMockFallback]);

  useEffect(() => {
    if (!selectedId || isMockConversationId(selectedId)) {
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

  const selectedMock = useMemo(
    () => mockConversations.find((c) => c.id === selectedId) ?? null,
    [mockConversations, selectedId],
  );

  const selectedApi = useMemo(
    () => conversations.find((c) => c.id === selectedId) ?? null,
    [conversations, selectedId],
  );

  const headerName =
    selectedMock?.pilotName ?? selectedApi?.counterpartName ?? "Messages";
  const headerInitials = initialsFromName(headerName);
  const headerStatus = selectedMock?.statusLabel ?? "Pilot · Online";

  const threadMessages: ThreadMessage[] = useMemo(() => {
    if (selectedMock) {
      return selectedMock.messages.map((m) => ({
        id: m.id,
        body: m.body,
        timeLabel: m.timeLabel,
        isMine: m.isMine,
      }));
    }

    if (detail) {
      return detail.messages.map((m: MessageDto) => ({
        id: m.id,
        body: m.body,
        timeLabel: formatBubbleTime(m.createdAt),
        isMine: m.isMine,
      }));
    }

    return [];
  }, [detail, selectedMock]);

  function selectConversation(id: string) {
    setSelectedId(id);
    setMobileChatOpen(true);
    setDraft("");
    setThreadError(null);

    if (isMockConversationId(id)) {
      setMockConversations((current) =>
        current.map((item) =>
          item.id === id ? { ...item, unreadCount: 0 } : item,
        ),
      );
    }
  }

  async function startConversation(jobApplicationId: string) {
    setStartingId(jobApplicationId);
    setListError(null);
    try {
      const res = await fetch(LIST_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobApplicationId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setListError(data.error ?? "Could not start conversation.");
      } else if (data.conversation?.id) {
        await loadList();
        setUseMockFallback(false);
        selectConversation(data.conversation.id as string);
      }
    } catch {
      setListError("Could not start conversation.");
    } finally {
      setStartingId(null);
    }
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const text = draft.trim();
    if (!text || !selectedId) return;

    if (isMockConversationId(selectedId)) {
      const newMessage: ClientMockMessage = {
        id: `mock-local-${Date.now()}`,
        body: text,
        timeLabel: formatBubbleTime(new Date().toISOString()),
        isMine: true,
      };

      setMockConversations((current) =>
        current.map((item) =>
          item.id === selectedId
            ? {
                ...item,
                preview: text,
                timeLabel: "now",
                messages: [...item.messages, newMessage],
              }
            : item,
        ),
      );
      setDraft("");
      return;
    }

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

  const showMockList = useMockFallback;
  const listItems = showMockList ? mockConversations : conversations;

  return (
    <div
      className={`client-messages-layout${mobileChatOpen ? " client-messages-layout--chat-open" : ""}`}
    >
      <aside className="client-messages-list">
        <h2 className="client-messages-list-title">Messages</h2>

        {listError ? (
          <p className="client-messages-list-error" role="alert">
            {listError}
          </p>
        ) : null}

        <div className="client-messages-list-scroll">
          {loadingList ? (
            <p className="client-messages-list-status">Loading conversations…</p>
          ) : listItems.length === 0 ? (
            <p className="client-messages-list-status">No conversations yet.</p>
          ) : showMockList ? (
            mockConversations.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`client-messages-list-item${selectedId === item.id ? " client-messages-list-item--active" : ""}`}
                onClick={() => selectConversation(item.id)}
              >
                <span className="client-messages-avatar" aria-hidden>
                  {item.initials}
                </span>
                <span className="client-messages-list-copy">
                  <span className="client-messages-list-row">
                    <span className="client-messages-list-name">{item.pilotName}</span>
                    <span className="client-messages-list-time">{item.timeLabel}</span>
                  </span>
                  <span className="client-messages-list-preview">{item.preview}</span>
                </span>
                {item.unreadCount > 0 ? (
                  <span className="client-messages-unread">{item.unreadCount}</span>
                ) : null}
              </button>
            ))
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

          {!showMockList && eligible.length > 0 ? (
            <div className="client-messages-eligible">
              <p className="client-messages-eligible-title">Start from a pilot bid</p>
              {eligible.map((app) => (
                <div key={app.id} className="client-messages-eligible-item">
                  <div>
                    <p className="client-messages-eligible-name">{app.pilotName}</p>
                    <p className="client-messages-eligible-meta">
                      {app.jobTitle} · {app.currency}{" "}
                      {app.proposedAmount.toLocaleString()}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="client-messages-eligible-btn"
                    disabled={startingId === app.id}
                    onClick={() => void startConversation(app.id)}
                  >
                    {startingId === app.id ? "Starting…" : "Message"}
                  </button>
                </div>
              ))}
            </div>
          ) : null}
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
              <p className="client-messages-chat-status">{headerStatus}</p>
            </div>
          </div>
        </header>

        <div className="client-messages-thread">
          {loadingThread ? (
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
  );
}
