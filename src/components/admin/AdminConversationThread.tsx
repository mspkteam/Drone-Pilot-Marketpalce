"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type AdminConversation = {
  id: string;
  jobTitle: string;
  clientName: string;
  pilotName: string;
  bookingId: string | null;
  messages: {
    id: string;
    senderEmail: string;
    senderRole: string;
    body: string;
    createdAt: string;
  }[];
};

export function AdminConversationThread({
  conversationId,
}: {
  conversationId: string;
}) {
  const [conversation, setConversation] = useState<AdminConversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/conversations/${conversationId}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to load.");
        setConversation(null);
      } else {
        setConversation(data.conversation);
      }
    } catch {
      setError("Failed to load.");
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }

  if (!conversation) {
    return (
      <p className="text-sm text-destructive">{error ?? "Not found."}</p>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      <Link
        href="/dashboard/admin/messages"
        className="text-sm font-medium text-gold-dark hover:text-gold"
      >
        ← Back to messages
      </Link>
      <div>
        <h1 className="text-xl font-semibold">{conversation.jobTitle}</h1>
        <p className="text-sm text-muted-foreground">
          {conversation.clientName} ↔ {conversation.pilotName}
          {conversation.bookingId ? " · Booking linked" : ""}
        </p>
        <p className="mt-2 text-xs text-muted-foreground">Read-only (admin)</p>
      </div>
      <div className="space-y-3 rounded-lg border border-border p-4">
        {conversation.messages.map((m) => (
          <div key={m.id} className="rounded-lg bg-surface px-3 py-2 text-sm">
            <p className="text-xs text-muted-foreground">
              {m.senderEmail} ({m.senderRole})
            </p>
            <p className="mt-1 whitespace-pre-wrap">{m.body}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {new Date(m.createdAt).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
