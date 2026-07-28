"use client";

import { useSession } from "next-auth/react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  SupportAttachmentUpload,
  appendSupportAttachments,
} from "@/components/support/SupportAttachmentUpload";
import { SupportMessageBubble } from "@/components/support/SupportMessageBubble";
import {
  formatSupportTicketId,
  SUPPORT_STATUS_BADGE,
  SUPPORT_STATUS_LABELS,
} from "@/components/support/support-chat-ui";
import { TypingIndicator } from "@/components/support/TypingIndicator";
import { inputClassName } from "@/components/ui/FormField";
import {
  SUPPORT_CLOSED_USER_MESSAGE,
  SUPPORT_INACTIVITY_CLOSE_MS,
  SUPPORT_RESOLVED_USER_MESSAGE,
} from "@/lib/support/constants";
import {
  SUPPORT_OPEN_EVENT,
  type SupportOpenDetail,
} from "@/lib/support/open-support-widget";
import { cn } from "@/lib/utils";
import type { SupportChatMessageDto } from "@/types/support";
import type { SupportChatThreadDto } from "@/types/support";

const STORAGE_CHAT_ID = "dm_support_chat_id";
const STORAGE_GUEST_TOKEN = "dm_support_guest_token";
const POLL_MS = 2000;
const POLL_BACKGROUND_MS = 30000;
const TYPING_PULSE_MS = 1000;

function isRequesterMessage(m: SupportChatMessageDto): boolean {
  return (
    !m.isSystem &&
    m.senderRole !== "admin" &&
    m.senderRole !== "system"
  );
}

function getLastRequesterMessageAt(messages: SupportChatMessageDto[]): number | null {
  let latest: number | null = null;
  for (const m of messages) {
    if (!isRequesterMessage(m)) continue;
    const t = new Date(m.createdAt).getTime();
    if (latest === null || t > latest) latest = t;
  }
  return latest;
}

type View = "closed" | "form" | "chat";

export function SupportChatWidget() {
  const { data: session } = useSession();
  const role = session?.user?.role;

  if (role === "moderator") {
    return null;
  }

  return <SupportChatWidgetInner session={session} />;
}

function SupportChatWidgetInner({
  session,
}: {
  session: ReturnType<typeof useSession>["data"];
}) {
  const [view, setView] = useState<View>("closed");
  const [chatId, setChatId] = useState<string | null>(null);
  const [guestToken, setGuestToken] = useState<string | null>(null);
  const [thread, setThread] = useState<SupportChatThreadDto | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [formFiles, setFormFiles] = useState<File[]>([]);
  const [replyFiles, setReplyFiles] = useState<File[]>([]);
  const [animateMessageIds, setAnimateMessageIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [hasUnread, setHasUnread] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const seenMessageIdsRef = useRef<Set<string>>(new Set());
  const typingPulseRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const inactivityClosingRef = useRef(false);

  useEffect(() => {
    if (!session?.user?.id) {
      setName("");
      setEmail("");
      return;
    }

    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/support/intake", { cache: "no-store" });
        const data = await res.json();
        if (!cancelled && res.ok) {
          setName(data.name ?? "");
          setEmail(data.email ?? "");
        }
      } catch {
        if (!cancelled && session.user?.email) {
          setEmail(session.user.email);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [session?.user?.id, session?.user?.email]);

  useEffect(() => {
    const savedId = localStorage.getItem(STORAGE_CHAT_ID);
    const savedToken = localStorage.getItem(STORAGE_GUEST_TOKEN);
    if (savedId) {
      setChatId(savedId);
      setGuestToken(savedToken);
    }
  }, []);

  function clearStoredChat() {
    localStorage.removeItem(STORAGE_CHAT_ID);
    localStorage.removeItem(STORAGE_GUEST_TOKEN);
    setChatId(null);
    setGuestToken(null);
  }

  const threadInitializedRef = useRef(false);

  const applyThread = useCallback(
    (chat: SupportChatThreadDto, panelOpen: boolean) => {
      const newAnimate = new Set<string>();
      let newAdminWhileClosed = false;
      for (const m of chat.messages) {
        if (seenMessageIdsRef.current.has(m.id)) continue;
        if (
          threadInitializedRef.current &&
          m.senderRole === "admin" &&
          !m.isSystem
        ) {
          newAnimate.add(m.id);
          if (!panelOpen) newAdminWhileClosed = true;
        }
        seenMessageIdsRef.current.add(m.id);
      }
      threadInitializedRef.current = true;
      if (newAnimate.size > 0) {
        setAnimateMessageIds((prev) => new Set([...prev, ...newAnimate]));
      }
      if (newAdminWhileClosed && chat.status !== "closed") {
        setHasUnread(true);
      }
      setThread(chat);
      if (chat.status === "closed") {
        stopTypingPulse();
        setHasUnread(false);
      }
    },
    [],
  );

  const loadThread = useCallback(
    async (
      id: string,
      token: string | null,
    ): Promise<SupportChatThreadDto | null> => {
      const headers: HeadersInit = {};
      if (token) headers["X-Support-Guest-Token"] = token;
      const url = token
        ? `/api/support/chats/${id}?guestToken=${encodeURIComponent(token)}`
        : `/api/support/chats/${id}`;
      const res = await fetch(url, { headers, cache: "no-store" });
      const data = await res.json();
      if (res.ok && data.chat) {
        applyThread(data.chat, view === "chat");
        return data.chat as SupportChatThreadDto;
      }
      return null;
    },
    [applyThread, view],
  );

  const closeForInactivity = useCallback(async () => {
    if (!chatId || inactivityClosingRef.current) return;
    inactivityClosingRef.current = true;
    stopTypingPulse();
    try {
      const headers: HeadersInit = { "Content-Type": "application/json" };
      if (guestToken) headers["X-Support-Guest-Token"] = guestToken;
      const url = guestToken
        ? `/api/support/chats/${chatId}/close?guestToken=${encodeURIComponent(guestToken)}`
        : `/api/support/chats/${chatId}/close`;
      await fetch(url, { method: "POST", headers });
    } catch {
      /* still dismiss locally */
    }
    clearStoredChat();
    seenMessageIdsRef.current = new Set();
    threadInitializedRef.current = false;
    setAnimateMessageIds(new Set());
    setThread(null);
    setReply("");
    setReplyFiles([]);
    setView("closed");
    setHasUnread(false);
    setError(null);
    inactivityClosingRef.current = false;
  }, [chatId, guestToken]);

  const checkInactivity = useCallback(
    (chat: SupportChatThreadDto | null) => {
      if (!chat || chat.status === "closed") return;
      const lastRequesterAt = getLastRequesterMessageAt(chat.messages);
      if (lastRequesterAt === null) return;
      if (Date.now() - lastRequesterAt >= SUPPORT_INACTIVITY_CLOSE_MS) {
        void closeForInactivity();
      }
    },
    [closeForInactivity],
  );

  useEffect(() => {
    if (!chatId) return;

    const poll = async () => {
      const chat = await loadThread(chatId, guestToken);
      if (!chat) {
        clearStoredChat();
        setThread(null);
        setView((v) => (v === "chat" ? "form" : v));
        return;
      }
      checkInactivity(chat);
    };

    void poll();

    const interval = setInterval(
      () => void poll(),
      view === "chat" ? POLL_MS : POLL_BACKGROUND_MS,
    );

    return () => clearInterval(interval);
  }, [view, chatId, guestToken, loadThread, checkInactivity]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread?.messages.length, thread?.otherPartyTyping, thread?.status]);

  useEffect(() => {
    return () => stopTypingPulse();
  }, []);

  const pingTyping = useCallback(async () => {
    if (!chatId) return;
    const headers: HeadersInit = {};
    if (guestToken) headers["X-Support-Guest-Token"] = guestToken;
    const url = guestToken
      ? `/api/support/chats/${chatId}/typing?guestToken=${encodeURIComponent(guestToken)}`
      : `/api/support/chats/${chatId}/typing`;
    await fetch(url, { method: "POST", headers });
  }, [chatId, guestToken]);

  function stopTypingPulse() {
    if (typingPulseRef.current) {
      clearInterval(typingPulseRef.current);
      typingPulseRef.current = null;
    }
  }

  function handleReplyChange(value: string) {
    setReply(value);
    if (!chatId || !value.trim()) {
      stopTypingPulse();
      return;
    }
    void pingTyping();
    if (!typingPulseRef.current) {
      typingPulseRef.current = setInterval(() => {
        void pingTyping();
      }, TYPING_PULSE_MS);
    }
  }

  async function startChat(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const formData = new FormData();
      formData.set("requesterName", name.trim());
      formData.set("requesterEmail", email.trim());
      formData.set("message", message);
      if (formFiles.length > 0) appendSupportAttachments(formData, formFiles);

      const res = await fetch("/api/support/chats", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not start chat.");
        return;
      }

      const id = data.chat.id as string;
      const token = (data.guestToken as string | undefined) ?? null;
      seenMessageIdsRef.current = new Set();
      threadInitializedRef.current = false;
      setAnimateMessageIds(new Set());
      setChatId(id);
      setGuestToken(token);
      localStorage.setItem(STORAGE_CHAT_ID, id);
      if (token) localStorage.setItem(STORAGE_GUEST_TOKEN, token);
      applyThread(data.chat, true);
      setView("chat");
      setHasUnread(false);
      setMessage("");
      setFormFiles([]);
    } catch {
      setError("Could not start chat.");
    } finally {
      setLoading(false);
    }
  }

  async function sendReply(e: React.FormEvent) {
    e.preventDefault();
    if (!chatId || loading) return;
    if (!reply.trim() && replyFiles.length === 0) return;
    setError(null);
    stopTypingPulse();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.set("message", reply);
      if (replyFiles.length > 0) appendSupportAttachments(formData, replyFiles);

      const headers: HeadersInit = {};
      if (guestToken) headers["X-Support-Guest-Token"] = guestToken;

      const res = await fetch(`/api/support/chats/${chatId}/messages`, {
        method: "POST",
        headers,
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not send message.");
        return;
      }
      await loadThread(chatId, guestToken);
      setReply("");
      setReplyFiles([]);
    } catch {
      setError("Could not send message.");
    } finally {
      setLoading(false);
    }
  }

  function startNewChat() {
    stopTypingPulse();
    clearStoredChat();
    seenMessageIdsRef.current = new Set();
    threadInitializedRef.current = false;
    setAnimateMessageIds(new Set());
    setThread(null);
    setReply("");
    setReplyFiles([]);
    setView("form");
    setHasUnread(false);
    setError(null);
  }

  async function openWidget(targetChatId?: string | null) {
    setError(null);
    if (view !== "closed" && !targetChatId) {
      setView("closed");
      stopTypingPulse();
      return;
    }
    setHasUnread(false);
    const activeChatId = targetChatId ?? chatId;
    const nextView = activeChatId ? "chat" : "form";
    setView(nextView);
    if (activeChatId && nextView === "chat") {
      if (targetChatId) {
        setChatId(targetChatId);
        localStorage.setItem(STORAGE_CHAT_ID, targetChatId);
      }
      const chat = await loadThread(activeChatId, guestToken);
      if (!chat) {
        clearStoredChat();
        setView("form");
      } else if (chat.status === "closed") {
        clearStoredChat();
        setThread(null);
        setView("form");
      }
    }
  }

  useEffect(() => {
    function handleSupportOpen(event: Event) {
      const detail = (event as CustomEvent<SupportOpenDetail>).detail;
      setError(null);
      setHasUnread(false);

      if (detail?.action === "new") {
        startNewChat();
        return;
      }

      if (detail?.chatId) {
        void openWidget(detail.chatId);
        return;
      }

      void openWidget();
    }

    window.addEventListener(SUPPORT_OPEN_EVENT, handleSupportOpen);
    return () => window.removeEventListener(SUPPORT_OPEN_EVENT, handleSupportOpen);
  }, []);

  const chatStatus = thread?.status;
  const isChatClosed = chatStatus === "closed";
  const isChatResolved = chatStatus === "resolved";
  const canSendReply =
    !loading && (reply.trim().length > 0 || replyFiles.length > 0);

  return (
    <div className="fixed bottom-4 right-4 z-[60] flex flex-col items-end gap-2 sm:bottom-6 sm:right-6">
      {view !== "closed" ? (
        <div
          className="flex h-[min(80vh,640px)] w-[min(400px,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-xl border border-border bg-background shadow-2xl sm:w-[min(420px,calc(100vw-2rem))]"
          role="dialog"
          aria-label="Talk to Support"
        >
          <div className="shrink-0 border-b border-border bg-surface-elevated px-4 py-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">
                  Talk to Support
                </p>
                <p className="text-xs text-muted-foreground">
                  Platform help desk
                </p>
                {chatId ? (
                  <p className="mt-1 font-mono text-[10px] text-muted-foreground">
                    Ticket #{formatSupportTicketId(chatId)}
                  </p>
                ) : null}
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1.5">
                {thread?.status ? (
                  <span
                    className={cn(
                      "rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                      SUPPORT_STATUS_BADGE[thread.status],
                    )}
                  >
                    {SUPPORT_STATUS_LABELS[thread.status]}
                  </span>
                ) : null}
                <button
                  type="button"
                  className="rounded-md px-2 py-1 text-sm text-muted-foreground hover:bg-surface"
                  onClick={() => setView("closed")}
                  aria-label="Minimize"
                >
                  −
                </button>
              </div>
            </div>
          </div>

          {error ? (
            <p
              className="shrink-0 bg-destructive/10 px-4 py-2 text-xs text-destructive"
              role="alert"
            >
              {error}
            </p>
          ) : null}

          {view === "form" ? (
            <form
              onSubmit={startChat}
              className="flex min-h-0 flex-1 flex-col overflow-y-auto p-4"
            >
              <p className="text-sm leading-relaxed text-muted-foreground">
                Need help? Send us a message and our support team will get back
                to you.
              </p>
              <label className="mt-4 block text-xs font-medium text-foreground">
                Full name *
                <input
                  required
                  minLength={2}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={cn(inputClassName, "mt-1.5 h-10")}
                  placeholder="Your name"
                  autoComplete="name"
                />
              </label>
              <label className="mt-3 block text-xs font-medium text-foreground">
                Email *
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={cn(inputClassName, "mt-1.5 h-10")}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </label>
              <label className="mt-3 block text-xs font-medium text-foreground">
                What do you need help with? *
                <textarea
                  required
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className={cn(inputClassName, "mt-1.5 min-h-[120px] resize-none")}
                  placeholder="Describe your issue…"
                />
              </label>
              <div className="mt-4">
                <p className="mb-2 text-xs font-medium text-foreground">
                  Attachments (optional)
                </p>
                <SupportAttachmentUpload
                  files={formFiles}
                  onFilesChange={setFormFiles}
                  disabled={loading}
                  label="Attach files"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="mt-5 w-full shrink-0 rounded-lg bg-gold px-4 py-3 text-sm font-semibold text-white hover:bg-gold-light hover:shadow-[0_0_16px_rgba(201,162,39,0.35)] disabled:opacity-60"
              >
                {loading ? "Starting…" : "Start Support Chat"}
              </button>
            </form>
          ) : (
            <div className="flex min-h-0 flex-1 flex-col">
              <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
                {thread?.messages.map((m) => (
                  <SupportMessageBubble
                    key={m.id}
                    message={m}
                    guestToken={guestToken}
                    variant="user"
                    animate={animateMessageIds.has(m.id)}
                  />
                ))}
                {thread?.otherPartyTyping && !isChatClosed ? (
                  <TypingIndicator label="Support" side="left" />
                ) : null}
                <div ref={bottomRef} />
              </div>

              {isChatResolved && !isChatClosed ? (
                <div className="shrink-0 border-t border-gold/30 bg-gold/10 px-4 py-3 text-sm text-gold-light">
                  {SUPPORT_RESOLVED_USER_MESSAGE}
                </div>
              ) : null}

              {isChatClosed ? (
                <div className="shrink-0 space-y-3 border-t border-border bg-surface px-4 py-4">
                  <p className="text-sm font-medium text-foreground">
                    {SUPPORT_CLOSED_USER_MESSAGE}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Need more help? Start a fresh conversation with our team.
                  </p>
                  <button
                    type="button"
                    onClick={startNewChat}
                    className="w-full rounded-lg border border-gold bg-gold/10 px-4 py-2.5 text-sm font-semibold text-gold-light hover:bg-gold/20"
                  >
                    Start a new support chat
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={sendReply}
                  className="shrink-0 border-t border-border bg-surface/50 p-3"
                >
                  <textarea
                    rows={3}
                    value={reply}
                    onChange={(e) => handleReplyChange(e.target.value)}
                    placeholder="Type a message…"
                    className={cn(inputClassName, "min-h-[72px] resize-none text-sm")}
                  />
                  <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <SupportAttachmentUpload
                      files={replyFiles}
                      onFilesChange={setReplyFiles}
                      disabled={loading}
                      label="Attach"
                      className="flex-1"
                    />
                    <button
                      type="submit"
                      disabled={!canSendReply}
                      className="shrink-0 rounded-lg bg-gold px-4 py-2.5 text-sm font-semibold text-white hover:bg-gold-light disabled:opacity-50"
                    >
                      {loading ? "Sending…" : "Send"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => void openWidget()}
        className="relative rounded-full bg-gold px-5 py-3 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-gold-light"
      >
        Talk to Support
        {hasUnread ? (
          <span
            className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-background bg-gold-light shadow-[0_0_8px_rgba(201,162,39,0.8)]"
            aria-label="New support message"
          />
        ) : null}
      </button>
    </div>
  );
}
