"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { SupportAttachmentUpload } from "@/components/support/SupportAttachmentUpload";
import { SupportMessageBubble } from "@/components/support/SupportMessageBubble";
import {
  formatSupportTicketId,
  SUPPORT_STATUS_BADGE,
  SUPPORT_STATUS_LABELS,
} from "@/components/support/support-chat-ui";
import { inputClassName } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import type { SupportChatStatus, SupportChatThreadDto } from "@/types/support";
import type { SupportRequesterRole } from "@/types/support";
import { cn } from "@/lib/utils";
import { TypingIndicator } from "@/components/support/TypingIndicator";

const POLL_MS = 2000;
const TYPING_PULSE_MS = 1000;

const REQUESTER_ROLE_LABELS: Record<SupportRequesterRole, string> = {
  guest: "Guest",
  client: "Client",
  pilot: "Pilot",
  admin: "Admin",
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
  const [sending, setSending] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const seenMessageIdsRef = useRef<Set<string>>(new Set());
  const threadInitializedRef = useRef(false);
  const typingPulseRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const applyThread = useCallback((chat: SupportChatThreadDto) => {
    for (const m of chat.messages) {
      seenMessageIdsRef.current.add(m.id);
    }
    threadInitializedRef.current = true;
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
    if (readOnly || sending) return;
    if (!reply.trim() && !file) return;
    setError(null);
    setSending(true);
    const formData = new FormData();
    formData.set("message", reply);
    if (file) formData.set("attachment", file);

    try {
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
    } catch {
      setError("Failed to send.");
    } finally {
      setSending(false);
    }
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

  const canSend = !sending && (reply.trim().length > 0 || file != null);

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/admin/support"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← Support chat list
      </Link>

      <div className="rounded-lg border border-border bg-surface-elevated p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-mono text-xs text-muted-foreground">
              Ticket #{formatSupportTicketId(thread.id)}
            </p>
            <h2 className="mt-1 text-lg font-semibold">{thread.requesterName}</h2>
            <p className="text-sm text-muted-foreground">{thread.requesterEmail}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              User type:{" "}
              <span className="font-medium text-foreground">
                {REQUESTER_ROLE_LABELS[thread.requesterRole]}
              </span>
            </p>
          </div>
          <span
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-semibold",
              SUPPORT_STATUS_BADGE[status],
            )}
          >
            {SUPPORT_STATUS_LABELS[status]}
          </span>
        </div>

        <div className="mt-4 rounded-lg border border-border/80 bg-surface/60 p-3">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Initial message
          </p>
          <p className="mt-2 whitespace-pre-wrap text-sm text-foreground">
            {thread.initialMessage}
          </p>
        </div>

        <p className="mt-3 text-xs text-muted-foreground">
          Created {new Date(thread.createdAt).toLocaleString()} · Last updated{" "}
          {new Date(thread.lastMessageAt).toLocaleString()}
        </p>

        {!readOnly ? (
          <div className="mt-5 space-y-3 border-t border-border pt-4">
            <p className="text-xs font-medium text-muted-foreground">
              Status controls
            </p>
            <div className="dashboard-filter-bar">
              {status === "open" ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={savingStatus}
                  onClick={() => void saveStatus("pending")}
                >
                  Mark pending
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
                  Mark resolved
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
                  Reopen
                </Button>
              ) : null}
            </div>
          </div>
        ) : (
          <p className="mt-4 text-xs text-muted-foreground">
            Moderators can view this thread and attachments but cannot reply or
            change status.
          </p>
        )}
      </div>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <div className="max-h-[min(55vh,520px)] space-y-3 overflow-y-auto rounded-lg border border-border bg-background/50 p-4">
        {thread.messages.map((m) => (
          <SupportMessageBubble
            key={m.id}
            message={m}
            variant="admin"
          />
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
          className="space-y-4 rounded-lg border border-border bg-surface-elevated p-4"
        >
          <label className="block text-sm font-medium text-foreground">
            Reply as support
            <textarea
              rows={4}
              value={reply}
              onChange={(e) => handleReplyChange(e.target.value)}
              className={cn(inputClassName, "mt-1.5 min-h-[100px] resize-none")}
              placeholder="Type your reply…"
            />
          </label>
          <SupportAttachmentUpload
            file={file}
            onFileChange={setFile}
            disabled={sending}
            label="Attach file"
          />
          <Button type="submit" disabled={!canSend}>
            {sending ? "Sending…" : "Send reply"}
          </Button>
        </form>
      )}
    </div>
  );
}
