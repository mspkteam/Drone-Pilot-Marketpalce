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
    return <p className="ras-help">Loading…</p>;
  }

  if (!conversation) {
    return (
      <p className="ras-alert ras-alert--danger">{error ?? "Not found."}</p>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      <Link href="/dashboard/admin/messages" className="ras-link text-sm">
        ← Back to messages
      </Link>
      <div className="ras-panel">
        <h1 className="ras-panel-heading">{conversation.jobTitle}</h1>
        <p className="ras-help">
          {conversation.clientName} ↔ {conversation.pilotName}
          {conversation.bookingId ? " · Booking linked" : ""}
        </p>
        <p className="mt-2 ras-soft text-xs">Read-only (admin)</p>
      </div>
      <div className="ras-panel space-y-3">
        {conversation.messages.map((m) => (
          <div key={m.id} className="ras-panel ras-panel--nested text-sm">
            <p className="ras-soft text-xs">
              {m.senderEmail} ({m.senderRole})
            </p>
            <p className="mt-1 whitespace-pre-wrap">{m.body}</p>
            <p className="mt-1 ras-soft text-xs">
              {new Date(m.createdAt).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
