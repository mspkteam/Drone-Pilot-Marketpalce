"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { inputClassName } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import type { SupportChatStatus, SupportChatThreadDto } from "@/types/support";
import { SUPPORT_CHAT_STATUSES } from "@/types/support";
import { cn } from "@/lib/utils";

const STATUS_LABELS: Record<SupportChatStatus, string> = {
  open: "Open",
  pending: "Pending",
  resolved: "Resolved",
  closed: "Closed",
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
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/support/chats/${chatId}`);
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Not found.");
      setThread(null);
    } else {
      setThread(data.chat);
      setStatus(data.chat.status);
    }
    setLoading(false);
  }, [chatId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread?.messages.length]);

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
    setReply("");
    setFile(null);
    await load();
  }

  async function saveStatus(next: SupportChatStatus) {
    if (readOnly) return;
    const res = await fetch(`/api/admin/support/chats/${chatId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Failed to update status.");
      return;
    }
    setStatus(next);
    router.refresh();
    await load();
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
        {!readOnly ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {SUPPORT_CHAT_STATUSES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => void saveStatus(s)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs",
                  status === s
                    ? "border-gold bg-gold/15 text-gold-dark"
                    : "border-border",
                )}
              >
                {STATUS_LABELS[s]}
              </button>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-sm">
            Status: <strong>{STATUS_LABELS[status]}</strong>
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
            <p className="whitespace-pre-wrap">{m.message}</p>
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
        <div ref={bottomRef} />
      </div>

      {readOnly ? (
        <p className="text-sm text-muted-foreground">
          Moderators have read-only access to this thread.
        </p>
      ) : (
        <form onSubmit={sendReply} className="space-y-3 rounded-lg border border-border p-4">
          <label className="block text-sm font-medium">
            Reply as support
            <textarea
              rows={3}
              value={reply}
              onChange={(e) => setReply(e.target.value)}
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
