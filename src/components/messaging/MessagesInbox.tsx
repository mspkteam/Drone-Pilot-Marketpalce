"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import type {
  ConversationListItemDto,
  EligibleApplicationDto,
} from "@/types/messaging";
import { cn } from "@/lib/utils";

type MessagesInboxProps = {
  role: "client" | "pilot";
  listApi: "/api/client/conversations" | "/api/pilot/conversations";
  threadBase: "/dashboard/client/messages" | "/dashboard/pilot/messages";
};

export function MessagesInbox({ role, listApi, threadBase }: MessagesInboxProps) {
  const [conversations, setConversations] = useState<ConversationListItemDto[]>(
    [],
  );
  const [eligible, setEligible] = useState<EligibleApplicationDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startingId, setStartingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(listApi);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to load messages.");
        setConversations([]);
        setEligible([]);
      } else {
        setConversations(data.conversations ?? []);
        setEligible(data.eligibleApplications ?? []);
      }
    } catch {
      setError("Failed to load messages.");
      setConversations([]);
      setEligible([]);
    } finally {
      setLoading(false);
    }
  }, [listApi]);

  useEffect(() => {
    void load();
  }, [load]);

  async function startConversation(jobApplicationId: string) {
    setStartingId(jobApplicationId);
    setError(null);
    try {
      const res = await fetch(listApi, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobApplicationId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not start conversation.");
      } else if (data.conversation?.id) {
        window.location.href = `${threadBase}/${data.conversation.id}`;
      }
    } catch {
      setError("Could not start conversation.");
    } finally {
      setStartingId(null);
    }
  }

  return (
    <div className="max-w-3xl space-y-8">
      {role === "pilot" ? (
        <p className="text-sm text-muted-foreground">
          Pilots cannot start new conversations. Reply when a client messages
          you about a bid.
        </p>
      ) : null}

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <section>
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold">Conversations</h2>
          <Button type="button" variant="ghost" size="sm" onClick={() => void load()}>
            Refresh
          </Button>
        </div>
        {loading ? (
          <p className="mt-4 text-sm text-muted-foreground">Loading…</p>
        ) : conversations.length === 0 ? (
          <p className="mt-4 empty-state">
            No conversations yet.
          </p>
        ) : (
          <ul className="mt-4 list-panel">
            {conversations.map((c) => (
              <li key={c.id}>
                <Link
                  href={`${threadBase}/${c.id}`}
                  className="flex flex-col gap-1 p-4 transition-colors hover:bg-surface sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium">{c.jobTitle}</p>
                    <p className="text-sm text-muted-foreground">
                      {c.counterpartName}
                    </p>
                    {c.lastMessagePreview ? (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {c.lastMessagePreview}
                      </p>
                    ) : null}
                  </div>
                  {c.unreadCount > 0 ? (
                    <span
                      className={cn(
                        "inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-gold px-2 text-xs font-medium text-gold-dark",
                      )}
                    >
                      {c.unreadCount}
                    </span>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {role === "client" && eligible.length > 0 ? (
        <section>
          <h2 className="text-lg font-semibold">Start from a pilot bid</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Message a pilot after you receive their application on your job.
          </p>
          <ul className="mt-4 list-panel">
            {eligible.map((a) => (
              <li
                key={a.id}
                className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium">{a.jobTitle}</p>
                  <p className="text-sm text-muted-foreground">
                    {a.pilotName} · {a.currency}{" "}
                    {a.proposedAmount.toLocaleString()}
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  disabled={startingId === a.id}
                  onClick={() => void startConversation(a.id)}
                >
                  {startingId === a.id ? "Starting…" : "Message pilot"}
                </Button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
