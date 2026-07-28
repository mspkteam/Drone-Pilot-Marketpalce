"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  adminSenderLabel,
  formatSupportTicketId,
  formatSupportMessageTime,
  supportAttachmentHref,
} from "@/components/support/support-chat-ui";
import {
  SupportAttachmentUpload,
  appendSupportAttachments,
} from "@/components/support/SupportAttachmentUpload";
import type { SupportChatStatus, SupportChatThreadDto } from "@/types/support";
import type { SupportRequesterRole } from "@/types/support";
import { TypingIndicator } from "@/components/support/TypingIndicator";

const POLL_MS = 2000;
const TYPING_PULSE_MS = 1000;

const REQUESTER_ROLE_LABELS: Record<SupportRequesterRole, string> = {
  guest: "Guest",
  client: "Client",
  pilot: "Pilot",
  admin: "Admin",
};

type AdminSupportThreadProps = {
  chatId: string;
  readOnly: boolean;
  embedded?: boolean;
  refreshToken?: number;
  onBack?: () => void;
};

function ThemedSupportBubble({
  message,
}: {
  message: SupportChatThreadDto["messages"][number];
}) {
  const senderLabel = adminSenderLabel(message);
  const isSupport = message.senderRole === "admin";
  const isSystem = message.isSystem;
  const href = message.attachmentUrl
    ? supportAttachmentHref(message.attachmentUrl)
    : null;
  const isImage = message.attachmentMimeType?.startsWith("image/");

  return (
    <div
      className={`admin-support-bubble${
        isSystem
          ? " admin-support-bubble--system"
          : isSupport
            ? " admin-support-bubble--support"
            : " admin-support-bubble--requester"
      }`}
    >
      {senderLabel ? (
        <div className="admin-support-bubble-sender">
          <span>{senderLabel}</span>
          <time dateTime={message.createdAt}>
            {formatSupportMessageTime(message.createdAt)}
          </time>
        </div>
      ) : (
        <time
          className="admin-support-bubble-sender"
          dateTime={message.createdAt}
        >
          {formatSupportMessageTime(message.createdAt)}
        </time>
      )}
      {message.message !== "(attachment)" ? (
        <p className="admin-support-bubble-body">{message.message}</p>
      ) : null}
      {href && isImage ? (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="admin-support-bubble-attachment"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={href} alt={message.attachmentFileName ?? "Attachment"} />
        </a>
      ) : null}
      {href && !isImage ? (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="admin-support-bubble-file-link"
        >
          {message.attachmentFileName ?? "View attachment"}
        </a>
      ) : null}
    </div>
  );
}

export function AdminSupportThread({
  chatId,
  readOnly,
  embedded = false,
  refreshToken = 0,
  onBack,
}: AdminSupportThreadProps) {
  const router = useRouter();
  const [thread, setThread] = useState<SupportChatThreadDto | null>(null);
  const [reply, setReply] = useState("");
  const [status, setStatus] = useState<SupportChatStatus>("open");
  const [files, setFiles] = useState<File[]>([]);
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
    if (refreshToken > 0) {
      void load({ silent: true });
    }
  }, [refreshToken, load]);

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
    if (!reply.trim() && files.length === 0) return;
    setError(null);
    setSending(true);
    const formData = new FormData();
    formData.set("message", reply);
    if (files.length > 0) appendSupportAttachments(formData, files);

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
      setFiles([]);
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
    return embedded ? (
      <div className="admin-support-thread-panel-inner">
        <div className="admin-support-messages">
          <p className="admin-support-messages-status">Loading thread…</p>
        </div>
      </div>
    ) : (
      <p className="text-sm text-muted-foreground">Loading thread…</p>
    );
  }

  if (!thread) {
    return embedded ? (
      <div className="admin-support-thread-panel-inner">
        <div className="admin-support-messages">
          <p className="admin-support-messages-error" role="alert">
            {error ?? "Chat not found."}
          </p>
        </div>
      </div>
    ) : (
      <p className="text-sm text-destructive">{error ?? "Chat not found."}</p>
    );
  }

  const canSend = !sending && (reply.trim().length > 0 || files.length > 0);

  const threadBody = (
    <>
      {!embedded ? (
        <Link
          href="/dashboard/admin/support"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Support chat list
        </Link>
      ) : null}

      <div className={embedded ? "admin-support-ticket-card" : "rounded-lg border border-border bg-surface-elevated p-4 sm:p-5"}>
        {embedded && onBack ? (
          <button
            type="button"
            className="admin-support-back-btn"
            onClick={onBack}
          >
            ← Back to list
          </button>
        ) : null}

        <div className="admin-support-ticket-head">
          <div className="min-w-0">
            <p className="admin-support-ticket-id">
              Ticket #{formatSupportTicketId(thread.id)}
            </p>
            <h2 className="admin-support-ticket-name">{thread.requesterName}</h2>
            <p className="admin-support-ticket-email">{thread.requesterEmail}</p>
            <p className="admin-support-ticket-role">
              User type:{" "}
              <strong>{REQUESTER_ROLE_LABELS[thread.requesterRole]}</strong>
            </p>
          </div>
          <span
            className={`admin-support-status-badge admin-support-status-badge--${status}`}
          >
            {status}
          </span>
        </div>

        <div className="admin-support-initial-message">
          <p className="admin-support-initial-label">Initial message</p>
          <p className="admin-support-initial-body">{thread.initialMessage}</p>
        </div>

        <p className="admin-support-ticket-dates">
          Created {new Date(thread.createdAt).toLocaleString()} · Last updated{" "}
          {new Date(thread.lastMessageAt).toLocaleString()}
        </p>

        {!readOnly ? (
          <div className="admin-support-status-controls">
            <p className="admin-support-status-controls-label">Status controls</p>
            <div className="admin-support-status-actions">
              {status === "open" ? (
                <button
                  type="button"
                  className="admin-support-action-btn admin-support-action-btn--outline"
                  disabled={savingStatus}
                  onClick={() => void saveStatus("pending")}
                >
                  Mark pending
                </button>
              ) : null}
              {status !== "resolved" && status !== "closed" ? (
                <button
                  type="button"
                  className="admin-support-action-btn admin-support-action-btn--gold"
                  disabled={savingStatus}
                  onClick={() => void saveStatus("resolved")}
                >
                  Mark resolved
                </button>
              ) : null}
              {status !== "closed" ? (
                <button
                  type="button"
                  className="admin-support-action-btn admin-support-action-btn--muted"
                  disabled={savingStatus}
                  onClick={() => void closeChat()}
                >
                  Close chat
                </button>
              ) : null}
              {status === "resolved" || status === "closed" ? (
                <button
                  type="button"
                  className="admin-support-action-btn admin-support-action-btn--outline"
                  disabled={savingStatus}
                  onClick={() => void saveStatus("open")}
                >
                  Reopen
                </button>
              ) : null}
            </div>
          </div>
        ) : (
          <p className="admin-support-ticket-role">
            Moderators can view this thread and attachments but cannot reply or
            change status.
          </p>
        )}
      </div>

      {error ? (
        <p className="admin-support-alert admin-support-alert--error" role="alert">
          {error}
        </p>
      ) : null}

      <div className={embedded ? "admin-support-messages" : "max-h-[min(55vh,520px)] space-y-3 overflow-y-auto rounded-lg border border-border bg-background/50 p-4"}>
        {thread.messages.map((m) =>
          embedded ? (
            <ThemedSupportBubble key={m.id} message={m} />
          ) : (
            <div key={m.id}>
              <ThemedSupportBubble message={m} />
            </div>
          ),
        )}
        {thread.otherPartyTyping ? (
          <TypingIndicator label={thread.requesterName} side="left" />
        ) : null}
        <div ref={bottomRef} />
      </div>

      {readOnly ? (
        <p className="admin-support-closed-note">
          Moderators have read-only access to this thread.
        </p>
      ) : status === "closed" ? (
        <p className="admin-support-closed-note">
          This chat is closed. Reopen it above to send another reply.
        </p>
      ) : embedded ? (
        <form onSubmit={(e) => void sendReply(e)} className="admin-support-reply-form">
          <label className="admin-support-reply-label" htmlFor={`reply-${chatId}`}>
            Reply as support
          </label>
          <textarea
            id={`reply-${chatId}`}
            rows={4}
            value={reply}
            onChange={(e) => handleReplyChange(e.target.value)}
            className="admin-support-textarea"
            placeholder="Type your reply…"
          />
          <div className="admin-support-reply-actions">
            <SupportAttachmentUpload
              files={files}
              onFilesChange={setFiles}
              disabled={sending}
              variant="admin"
              label="Attach files"
            />
            <button
              type="submit"
              className="admin-support-send-btn"
              disabled={!canSend}
            >
              {sending ? "Sending…" : "Send reply"}
            </button>
          </div>
        </form>
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
              className="mt-1.5 min-h-[100px] w-full resize-none rounded-lg border border-border bg-surface px-3 py-2"
              placeholder="Type your reply…"
            />
          </label>
          <SupportAttachmentUpload
            files={files}
            onFilesChange={setFiles}
            disabled={sending}
            variant="admin"
            label="Attach files"
          />
          <button
            type="submit"
            className="admin-support-send-btn"
            disabled={!canSend}
          >
            {sending ? "Sending…" : "Send reply"}
          </button>
        </form>
      )}
    </>
  );

  if (embedded) {
    return (
      <div className="admin-support-thread-panel-inner">{threadBody}</div>
    );
  }

  return <div className="space-y-6">{threadBody}</div>;
}
