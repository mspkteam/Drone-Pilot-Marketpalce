"use client";

import { useSession } from "next-auth/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { inputClassName } from "@/components/ui/FormField";
import { cn } from "@/lib/utils";
import type { SupportChatThreadDto } from "@/types/support";
import { TypingIndicator } from "@/components/support/TypingIndicator";
import { TypewriterMessage } from "@/components/support/TypewriterMessage";
import {
  SUPPORT_CLOSED_USER_MESSAGE,
  SUPPORT_RESOLVED_USER_MESSAGE,
} from "@/lib/support/constants";

const STORAGE_CHAT_ID = "dm_support_chat_id";
const STORAGE_GUEST_TOKEN = "dm_support_guest_token";
const POLL_MS = 2000;
const TYPING_PULSE_MS = 1000;

type View = "closed" | "form" | "chat";

function attachmentSrc(
  fileName: string,
  guestToken: string | null,
): string {
  const base = `/api/support/files/${encodeURIComponent(fileName)}`;
  if (guestToken) {
    return `${base}?guestToken=${encodeURIComponent(guestToken)}`;
  }
  return base;
}

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
  const [formFile, setFormFile] = useState<File | null>(null);
  const [replyFile, setReplyFile] = useState<File | null>(null);
  const [animateMessageIds, setAnimateMessageIds] = useState<Set<string>>(
    () => new Set(),
  );
  const bottomRef = useRef<HTMLDivElement>(null);
  const seenMessageIdsRef = useRef<Set<string>>(new Set());
  const typingPulseRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name ?? "");
      setEmail(session.user.email ?? "");
    }
  }, [session]);

  useEffect(() => {
    const savedId = localStorage.getItem(STORAGE_CHAT_ID);
    const savedToken = localStorage.getItem(STORAGE_GUEST_TOKEN);
    if (savedId) {
      setChatId(savedId);
      setGuestToken(savedToken);
      setView("chat");
    }
  }, []);

  const threadInitializedRef = useRef(false);

  const applyThread = useCallback((chat: SupportChatThreadDto) => {
    const newAnimate = new Set<string>();
    for (const m of chat.messages) {
      if (seenMessageIdsRef.current.has(m.id)) continue;
      if (
        threadInitializedRef.current &&
        m.senderRole === "admin" &&
        !m.isSystem
      ) {
        newAnimate.add(m.id);
      }
      seenMessageIdsRef.current.add(m.id);
    }
    threadInitializedRef.current = true;
    if (newAnimate.size > 0) {
      setAnimateMessageIds((prev) => new Set([...prev, ...newAnimate]));
    }
    setThread(chat);
    if (chat.status === "closed") {
      stopTypingPulse();
    }
  }, []);

  const loadThread = useCallback(
    async (id: string, token: string | null): Promise<boolean> => {
      const headers: HeadersInit = {};
      if (token) headers["X-Support-Guest-Token"] = token;
      const url = token
        ? `/api/support/chats/${id}?guestToken=${encodeURIComponent(token)}`
        : `/api/support/chats/${id}`;
      const res = await fetch(url, { headers, cache: "no-store" });
      const data = await res.json();
      if (res.ok && data.chat) {
        applyThread(data.chat);
        return true;
      }
      return false;
    },
    [applyThread],
  );

  useEffect(() => {
    if (view !== "chat" || !chatId) return;

    void loadThread(chatId, guestToken).then((ok) => {
      if (!ok) {
        localStorage.removeItem(STORAGE_CHAT_ID);
        localStorage.removeItem(STORAGE_GUEST_TOKEN);
        setChatId(null);
        setGuestToken(null);
        setView("form");
      }
    });

    const interval = setInterval(() => {
      void loadThread(chatId, guestToken);
    }, POLL_MS);

    return () => clearInterval(interval);
  }, [view, chatId, guestToken, loadThread]);

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
      formData.set("requesterName", name);
      formData.set("requesterEmail", email);
      formData.set("message", message);
      if (formFile) formData.set("attachment", formFile);

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
      applyThread(data.chat);
      setView("chat");
      setMessage("");
      setFormFile(null);
    } catch {
      setError("Could not start chat.");
    } finally {
      setLoading(false);
    }
  }

  async function sendReply(e: React.FormEvent) {
    e.preventDefault();
    if (!chatId) return;
    setError(null);
    stopTypingPulse();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.set("message", reply);
      if (replyFile) formData.set("attachment", replyFile);

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
      setReplyFile(null);
    } catch {
      setError("Could not send message.");
    } finally {
      setLoading(false);
    }
  }

  function startNewChat() {
    stopTypingPulse();
    localStorage.removeItem(STORAGE_CHAT_ID);
    localStorage.removeItem(STORAGE_GUEST_TOKEN);
    seenMessageIdsRef.current = new Set();
    threadInitializedRef.current = false;
    setAnimateMessageIds(new Set());
    setChatId(null);
    setGuestToken(null);
    setThread(null);
    setReply("");
    setReplyFile(null);
    setView("form");
    setError(null);
  }

  async function openWidget() {
    setError(null);
    if (view !== "closed") {
      setView("closed");
      return;
    }
    const nextView = chatId ? "chat" : "form";
    setView(nextView);
    if (chatId && nextView === "chat") {
      await loadThread(chatId, guestToken);
    }
  }

  const chatStatus = thread?.status;
  const isChatClosed = chatStatus === "closed";
  const isChatResolved = chatStatus === "resolved";

  return (
    <div className="fixed bottom-4 right-4 z-[60] flex flex-col items-end gap-2 sm:bottom-6 sm:right-6">
      {view !== "closed" ? (
        <div
          className="flex h-[min(520px,75vh)] w-[min(380px,calc(100vw-2rem))] flex-col overflow-hidden rounded-xl border border-border bg-background shadow-2xl"
          role="dialog"
          aria-label="Talk to Support"
        >
          <div className="flex items-center justify-between border-b border-border bg-surface-elevated px-4 py-3">
            <div>
              <p className="text-sm font-semibold">Talk to Support</p>
              <p className="text-xs text-muted-foreground">Platform help desk</p>
            </div>
            <button
              type="button"
              className="rounded-md px-2 py-1 text-sm text-muted-foreground hover:bg-surface"
              onClick={() => setView("closed")}
              aria-label="Minimize"
            >
              −
            </button>
          </div>

          {error ? (
            <p className="bg-destructive/10 px-4 py-2 text-xs text-destructive" role="alert">
              {error}
            </p>
          ) : null}

          {view === "form" ? (
            <form onSubmit={startChat} className="flex flex-1 flex-col overflow-y-auto p-4">
              <p className="text-sm text-muted-foreground">
                Need help? Send us a quick message and our support team will get back
                to you.
              </p>
              <label className="mt-4 block text-xs font-medium">
                Full name *
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={cn(inputClassName, "mt-1")}
                  disabled={!!session?.user}
                />
              </label>
              <label className="mt-3 block text-xs font-medium">
                Email *
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={cn(inputClassName, "mt-1")}
                  disabled={!!session?.user}
                />
              </label>
              <label className="mt-3 block text-xs font-medium">
                What do you need help with? *
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className={cn(inputClassName, "mt-1 resize-none")}
                />
              </label>
              <label className="mt-3 block text-xs font-medium">
                Upload image (optional)
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  className="mt-1 block w-full text-xs"
                  onChange={(e) =>
                    setFormFile(e.target.files?.[0] ?? null)
                  }
                />
              </label>
              <button
                type="submit"
                disabled={loading}
                className="mt-4 w-full rounded-lg bg-gold px-4 py-2.5 text-sm font-semibold text-white hover:bg-gold-light hover:shadow-[0_0_16px_rgba(201,162,39,0.35)] disabled:opacity-60"
              >
                {loading ? "Starting…" : "Start Support Chat"}
              </button>
            </form>
          ) : (
            <>
              <div className="flex-1 space-y-3 overflow-y-auto p-4">
                {thread?.messages.map((m) => (
                  <div
                    key={m.id}
                    className={cn(
                      "max-w-[90%] rounded-lg px-3 py-2 text-sm",
                      m.isSystem
                        ? "mx-auto max-w-full border border-gold/30 bg-gold/10 text-gold-dark"
                        : m.senderRole === "admin"
                          ? "ml-0 mr-auto bg-surface-elevated"
                          : "ml-auto mr-0 bg-gold/15",
                    )}
                  >
                    {!m.isSystem ? (
                      <p className="text-[10px] font-medium text-muted-foreground">
                        {m.senderName}
                      </p>
                    ) : null}
                    <p>
                      {animateMessageIds.has(m.id) && m.senderRole === "admin" ? (
                        <TypewriterMessage text={m.message} animate />
                      ) : (
                        <span className="whitespace-pre-wrap">{m.message}</span>
                      )}
                    </p>
                    {m.attachmentUrl ? (
                      m.attachmentMimeType?.startsWith("image/") ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={attachmentSrc(m.attachmentUrl, guestToken)}
                          alt=""
                          className="mt-2 max-h-32 rounded border border-border"
                        />
                      ) : (
                        <a
                          href={attachmentSrc(m.attachmentUrl, guestToken)}
                          className="mt-2 block text-xs text-gold-dark underline"
                          target="_blank"
                          rel="noreferrer"
                        >
                          {m.attachmentFileName ?? "View attachment"}
                        </a>
                      )
                    ) : null}
                  </div>
                ))}
                {thread?.otherPartyTyping && !isChatClosed ? (
                  <TypingIndicator label="Support" side="left" />
                ) : null}
                <div ref={bottomRef} />
              </div>

              {isChatResolved && !isChatClosed ? (
                <div className="border-t border-emerald-600/30 bg-emerald-600/10 px-4 py-3 text-sm text-emerald-900">
                  {SUPPORT_RESOLVED_USER_MESSAGE}
                </div>
              ) : null}

              {isChatClosed ? (
                <div className="space-y-3 border-t border-border bg-surface px-4 py-4">
                  <p className="text-sm font-medium text-foreground">
                    {SUPPORT_CLOSED_USER_MESSAGE}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Need more help? Start a fresh conversation with our team.
                  </p>
                  <button
                    type="button"
                    onClick={startNewChat}
                    className="w-full rounded-md border border-gold bg-gold/10 px-4 py-2.5 text-sm font-semibold text-gold-dark hover:bg-gold/20"
                  >
                    Start a new support chat
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={sendReply}
                  className="border-t border-border p-3"
                >
                  <textarea
                    rows={2}
                    value={reply}
                    onChange={(e) => handleReplyChange(e.target.value)}
                    placeholder="Type a message…"
                    className={cn(inputClassName, "resize-none text-sm")}
                  />
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,application/pdf"
                      className="max-w-[140px] text-[10px]"
                      onChange={(e) =>
                        setReplyFile(e.target.files?.[0] ?? null)
                      }
                    />
                    <button
                      type="submit"
                      disabled={loading}
                      className="ml-auto rounded-lg bg-gold px-3 py-1.5 text-xs font-semibold text-white hover:bg-gold-light disabled:opacity-60"
                    >
                      Send
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => void openWidget()}
        className="rounded-full bg-gold px-5 py-3 text-sm font-semibold text-black shadow-lg hover:bg-gold-light"
      >
        Talk to Support
      </button>
    </div>
  );
}
