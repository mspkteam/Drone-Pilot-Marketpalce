"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { FormField, inputClassName } from "@/components/ui/FormField";
import type { ConversationDetailDto, MessageDto } from "@/types/messaging";
import { MessageAttachmentList } from "@/components/messaging/MessageAttachmentList";
import { uploadMessageFiles } from "@/lib/messaging/upload-message-files";
import { cn } from "@/lib/utils";

type ConversationThreadProps = {
  conversationId: string;
  apiBase: "/api/client/conversations" | "/api/pilot/conversations";
  backHref: string;
  readOnly?: boolean;
};

export function ConversationThread({
  conversationId,
  apiBase,
  backHref,
  readOnly = false,
}: ConversationThreadProps) {
  const [conversation, setConversation] = useState<ConversationDetailDto | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [body, setBody] = useState("");
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiBase}/${conversationId}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to load conversation.");
        setConversation(null);
      } else {
        setConversation(data.conversation);
      }
    } catch {
      setError("Failed to load conversation.");
      setConversation(null);
    } finally {
      setLoading(false);
    }
  }, [apiBase, conversationId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (readOnly) return;
    const text = body.trim();
    if (!text && pendingFiles.length === 0) return;
    setSending(true);
    setError(null);
    try {
      let attachments: MessageDto["attachments"] = [];
      if (pendingFiles.length > 0) {
        const uploaded = await uploadMessageFiles(pendingFiles);
        if (!uploaded.ok) {
          setError(uploaded.error);
          return;
        }
        attachments = uploaded.attachments;
      }
      const res = await fetch(`${apiBase}/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: text, attachments }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to send message.");
      } else {
        setBody("");
        setPendingFiles([]);
        const newMsg = data.message as MessageDto;
        setConversation((prev) =>
          prev
            ? {
                ...prev,
                messages: [...prev.messages, newMsg],
                lastMessagePreview: newMsg.body,
                lastMessageAt: newMsg.createdAt,
              }
            : prev,
        );
      }
    } catch {
      setError("Failed to send message.");
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading conversation…</p>;
  }

  if (!conversation) {
    return (
      <div>
        <p className="text-sm text-destructive" role="alert">
          {error ?? "Conversation not found."}
        </p>
        <Link href={backHref} className="mt-4 inline-block text-sm text-gold-dark">
          ← Back to messages
        </Link>
      </div>
    );
  }

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <div>
        <Link
          href={backHref}
          className="text-sm font-medium text-gold-dark hover:text-gold"
        >
          ← Back to messages
        </Link>
        <h1 className="mt-2 text-xl font-semibold">{conversation.jobTitle}</h1>
        <p className="text-sm text-muted-foreground">
          With {conversation.counterpartName}
          {conversation.bookingId ? " · Booking linked" : ""}
        </p>
      </div>

      <div className="min-h-[280px] space-y-3 rounded-lg border border-border bg-surface-elevated p-4">
        {conversation.messages.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">
            No messages yet. Say hello to get started.
          </p>
        ) : (
          conversation.messages.map((m) => (
            <div
              key={m.id}
              className={cn(
                "max-w-[85%] rounded-lg px-3 py-2 text-sm",
                m.isMine
                  ? "ml-auto bg-gold/15 text-foreground"
                  : "bg-surface text-foreground",
              )}
            >
              <p className="text-xs font-medium text-muted-foreground">
                {m.senderLabel}
              </p>
              <p className="mt-1 whitespace-pre-wrap">{m.body}</p>
              <MessageAttachmentList attachments={m.attachments} />
              <p className="mt-1 text-xs text-muted-foreground">
                {new Date(m.createdAt).toLocaleString()}
              </p>
            </div>
          ))
        )}
      </div>

      {readOnly ? (
        <p className="text-sm text-muted-foreground">
          Read-only view for admin support and dispute review.
        </p>
      ) : (
        <form onSubmit={(e) => void handleSend(e)} className="space-y-3">
          <FormField label="Message" htmlFor="message-body">
            <textarea
              id="message-body"
              rows={3}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className={inputClassName}
              placeholder="Type your message…"
            />
          </FormField>
          <input
            type="file"
            multiple
            accept="image/png,image/jpeg,image/webp,image/gif,application/pdf"
            onChange={(e) => {
              const files = Array.from(e.target.files ?? []);
              e.target.value = "";
              setPendingFiles((current) => [...current, ...files].slice(0, 4));
            }}
          />
          {pendingFiles.length > 0 ? (
            <p className="text-xs text-muted-foreground">
              {pendingFiles.length} file{pendingFiles.length === 1 ? "" : "s"} ready to send
            </p>
          ) : null}
          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
          <Button type="submit" disabled={sending || (!body.trim() && pendingFiles.length === 0)}>
            {sending ? "Sending…" : "Send"}
          </Button>
        </form>
      )}
    </div>
  );
}
