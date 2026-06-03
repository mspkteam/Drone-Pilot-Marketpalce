"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { inputClassName } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import type { SupportChatStatus, SupportChatThreadDto } from "@/types/support";
import { cn } from "@/lib/utils";
import { TypingIndicator } from "@/components/support/TypingIndicator";
import { TypewriterMessage } from "@/components/support/TypewriterMessage";

const POLL_MS = 2000;
const TYPING_PULSE_MS = 1000;

const STATUS_LABELS: Record<SupportChatStatus, string> = {
  open: "Open",
  pending: "In progress",
  resolved: "Resolved",
  closed: "Closed",
};

const STATUS_BADGE: Record<SupportChatStatus, string> = {
  open: "border-gold/40 bg-gold/10 text-gold-dark",
  pending: "border-amber-500/40 bg-amber-500/10 text-amber-800",
  resolved: "border-emerald-600/40 bg-emerald-600/10 text-emerald-800",
  closed: "border-border bg-surface text-muted-foreground",
};

export function AdminSupportThread({
  chatId,
  readOnly,
}: {
  chatId: string;
  readOnly: boolean;
}) {
  const router = useRouter();
  const [thread, setThread] = useState<SupportChatThreadDto | null>(null);
  const [reply, setReply] = useState("");
  const [status, setStatus] = useState<SupportChatStatus>("open");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingStatus, setSavingStatus] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [animateMessageIds, setAnimateMessageIds] = useState<Set<string>>(
    () => new Set(),
  );
  const bottomRef = useRef<HTMLDivElement>(null);
  const seenMessageIdsRef = useRef<Set<string>>(new Set());
  const threadInitializedRef = useRef(false);
  const typingPulseRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const applyThread = useCallback((chat: SupportChatThreadDto) => {
    const newAnimate = new Set<string>();
    for (const m of chat.messages) {
      if (seenMessageIdsRef.current.has(m.id)) continue;
      if (
        threadInitializedRef.current &&
        m.senderRole !== "admin" &&
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
    setStatus(chat.status);
  }, []);

  const load = useCallback(
    async (opts?: { silent?: boolean }) => {
      if (!opts?.silent) setLoading(true);
      const res = await fetch(`/api/admin/support/chats/${chatId}`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok) {
        if (!opts?.silent) {
          setError(data.error ?? "Not found.");
          setThread(null);
        }
      } else {
        applyThread(data.chat);
      }
      if (!opts?.silent) setLoading(false);
    },
    [chatId, applyThread],
  );

  useEffect(() => {
    void load();
    const interval = setInterval(() => void load({ silent: true }), POLL_MS);
    return () => clearInterval(interval);
  }, [load]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread?.messages.length, thread?.otherPartyTyping]);

  useEffect(() => {
    return () => stopTypingPulse();
  }, []);

  const pingTyping = useCallback(async () => {
    if (readOnly) return;
    await fetch(`/api/admin/support/chats/${chatId}/typing`, { method: "POST" });
  }, [chatId, readOnly]);

  function stopTypingPulse() {
    if (typingPulseRef.current) {
      clearInterval(typingPulseRef.current);
      typingPulseRef.current = null;
    }
  }

  function handleReplyChange(value: string) {
    setReply(value);
    if (readOnly || !value.trim()) {
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

  async function sendReply(e: React.FormEvent) {
    e.preventDefault();
    if (readOnly) return;
    setError(null);
    const formData = new FormData();
    formData.set("message", reply);
    if (file) formData.set("attachment", file);

    const res = await fetch(`/api/admin/support/chats/${chatId}/messages`, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Failed to send.");
      return;
    }
    stopTypingPulse();
    setReply("");
    setFile(null);
    await load({ silent: true });
  }

  async function saveStatus(next: SupportChatStatus) {
    if (readOnly || savingStatus) return;
    setSavingStatus(true);
    setError(null);
    const res = await fetch(`/api/admin/support/chats/${chatId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    const data = await res.json();
    setSavingStatus(false);
    if (!res.ok) {
      setError(data.error ?? "Failed to update status.");
      return;
    }
    setStatus(next);
    router.refresh();
    await load({ silent: true });
  }

  async function closeChat() {
    if (
      !window.confirm(
        "Close this chat? The user will not be able to send new messages.",
      )
    ) {
      return;
    }
    await saveStatus("closed");
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading thread…</p>;
  }

  if (!thread) {
    return (
      <p className="text-sm text-destructive">{error ?? "Chat not found."}</p>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/admin/support"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← Support chat list
      </Link>

      <div className="rounded-lg border border-border bg-surface-elevated p-4">
        <h2 className="text-lg font-semibold">{thread.requesterName}</h2>
        <p className="text-sm text-muted-foreground">
          {thread.requesterEmail} · {thread.requesterRole}
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          Created {new Date(thread.createdAt).toLocaleString()}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">
            Status
          </span>
          <span
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-semibold",
              STATUS_BADGE[status],
            )}
          >
            {STATUS_LABELS[status]}
          </span>
        </div>

        {!readOnly ? (
          <div className="mt-5 space-y-3 border-t border-border pt-4">
            <p className="text-xs font-medium text-muted-foreground">
              Manage conversation
            </p>
            <div className="flex flex-wrap gap-2">
              {status === "open" ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={savingStatus}
                  onClick={() => void saveStatus("pending")}
                >
                  Mark in progress
                </Button>
              ) : null}
              {status !== "resolved" && status !== "closed" ? (
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  disabled={savingStatus}
                  onClick={() => void saveStatus("resolved")}
                >
                  Mark as resolved
                </Button>
              ) : null}
              {status !== "closed" ? (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={savingStatus}
                  onClick={() => void closeChat()}
                >
                  Close chat
                </Button>
              ) : null}
              {status === "resolved" || status === "closed" ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={savingStatus}
                  onClick={() => void saveStatus("open")}
                >
                  Reopen chat
                </Button>
              ) : null}
            </div>
            <p className="text-xs text-muted-foreground">
              {status === "closed"
                ? "This chat is closed. Reopen it to allow the user to message again."
                : status === "resolved"
                  ? "Resolved — the user can still reply. Close the chat to lock it."
                  : status === "pending"
                    ? "In progress — mark resolved when the issue is handled."
                    : "New request — mark in progress when you start helping."}
            </p>
          </div>
        ) : (
          <p className="mt-3 text-xs text-muted-foreground">
            Moderators can view status but cannot change it.
          </p>
        )}
      </div>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <div className="max-h-[50vh] space-y-3 overflow-y-auto rounded-lg border border-border p-4">
        {thread.messages.map((m) => (
          <div
            key={m.id}
            className={cn(
              "max-w-[85%] rounded-lg px-3 py-2 text-sm",
              m.isSystem
                ? "mx-auto max-w-full border border-gold/30 bg-gold/10 text-gold-dark"
                : m.senderRole === "admin"
                  ? "ml-auto bg-gold/15"
                  : "bg-surface-elevated",
            )}
          >
            {!m.isSystem ? (
              <p className="text-[10px] text-muted-foreground">{m.senderName}</p>
            ) : null}
            <p>
              {animateMessageIds.has(m.id) && m.senderRole !== "admin" ? (
                <TypewriterMessage text={m.message} animate />
              ) : (
                <span className="whitespace-pre-wrap">{m.message}</span>
              )}
            </p>
            {m.attachmentUrl ? (
              m.attachmentMimeType?.startsWith("image/") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`/api/support/files/${encodeURIComponent(m.attachmentUrl)}`}
                  alt=""
                  className="mt-2 max-h-40 rounded border border-border"
                />
              ) : (
                <a
                  href={`/api/support/files/${encodeURIComponent(m.attachmentUrl)}`}
                  className="mt-2 block text-xs text-gold-dark underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  {m.attachmentFileName ?? "Attachment"}
                </a>
              )
            ) : null}
          </div>
        ))}
        {thread.otherPartyTyping ? (
          <TypingIndicator label={thread.requesterName} side="left" />
        ) : null}
        <div ref={bottomRef} />
      </div>

      {readOnly ? (
        <p className="text-sm text-muted-foreground">
          Moderators have read-only access to this thread.
        </p>
      ) : status === "closed" ? (
        <p className="rounded-lg border border-border bg-surface px-4 py-3 text-sm text-muted-foreground">
          This chat is closed. Reopen it above to send another reply.
        </p>
      ) : (
        <form
          onSubmit={(e) => void sendReply(e)}
          className="space-y-3 rounded-lg border border-border p-4"
        >
          <label className="block text-sm font-medium">
            Reply as support
            <textarea
              rows={3}
              value={reply}
              onChange={(e) => handleReplyChange(e.target.value)}
              className={cn(inputClassName, "mt-1 resize-none")}
              placeholder="Type your reply…"
            />
          </label>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            className="block text-xs"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          <Button type="submit" disabled={!reply.trim() && !file}>
            Send reply
          </Button>
        </form>
      )}
    </div>
  );
}
