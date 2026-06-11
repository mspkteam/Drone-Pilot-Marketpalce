"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  formatSupportMessageTime,
  formatSupportTicketId,
  SUPPORT_STATUS_LABELS,
} from "@/components/support/support-chat-ui";
import { listPopularHelpArticles, searchHelpArticles } from "@/lib/help/help-articles";
import { openSupportChatWidget } from "@/lib/support/open-support-widget";
import type { SupportChatDto } from "@/types/support";

const SUPPORT_CHATS_API = "/api/support/chats" as const;
const OPEN_STATUSES = new Set(["open", "pending"]);

function LifebuoyIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden>
      <circle cx="18" cy="18" r="11.5" stroke="currentColor" strokeWidth="2" />
      <circle cx="18" cy="18" r="4" stroke="currentColor" strokeWidth="2" />
      <path
        d="M18 6.5v3M18 26.5v3M6.5 18h3M26.5 18h3M9.4 9.4l2.1 2.1M24.5 24.5l2.1 2.1M9.4 26.6l2.1-2.1M24.5 11.5l2.1-2.1"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ArticleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <path
        d="M5 3.5h8.5L13.5 6v8.5a1 1 0 01-1 1H5a1 1 0 01-1-1v-10a1 1 0 011-1z"
        stroke="currentColor"
        strokeWidth="1.25"
      />
      <path d="M7.5 6h4M7.5 9h4M7.5 12h2.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M2.5 3.5h11v6.5H9.2L6.5 13v-3H2.5V3.5z"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="7" cy="7" r="4.25" stroke="currentColor" strokeWidth="1.25" />
      <path d="M10.2 10.2L13 13" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
    </svg>
  );
}

function ticketTitle(chat: SupportChatDto): string {
  if (chat.subject?.trim()) return chat.subject.trim();
  const preview = chat.initialMessage.trim();
  if (preview.length <= 72) return preview;
  return `${preview.slice(0, 69)}…`;
}

export function PilotSupportHelpCenter() {
  const [query, setQuery] = useState("");
  const [chats, setChats] = useState<SupportChatDto[]>([]);
  const [loadingChats, setLoadingChats] = useState(true);
  const [chatError, setChatError] = useState<string | null>(null);

  useEffect(() => {
    fetch(SUPPORT_CHATS_API)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          setChatError(data.error ?? "Failed to load tickets.");
          setChats([]);
        } else {
          setChats(data.chats ?? []);
        }
      })
      .catch(() => {
        setChatError("Failed to load tickets.");
        setChats([]);
      })
      .finally(() => setLoadingChats(false));
  }, []);

  const articles = useMemo(() => {
    if (query.trim()) {
      return searchHelpArticles(query, { audience: "pilot" });
    }
    return listPopularHelpArticles("pilot", 6);
  }, [query]);

  const openTickets = useMemo(
    () => chats.filter((chat) => OPEN_STATUSES.has(chat.status)),
    [chats],
  );

  return (
    <div className="pilot-support-page">
      <Link href="/dashboard/pilot" className="pilot-support-back">
        ← Back
      </Link>

      <header className="pilot-support-header">
        <p className="pilot-support-eyebrow">ACCOUNT / SUPPORT</p>
        <h1 className="pilot-support-title">Support &amp; Help Center</h1>
      </header>

      <section className="pilot-support-hero" aria-label="Help search">
        <LifebuoyIcon />
        <h2 className="pilot-support-hero-title">How can ground control help?</h2>
        <label className="pilot-support-search-wrap">
          <span className="pilot-support-search-icon">
            <SearchIcon />
          </span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search help articles..."
            className="pilot-support-search"
            aria-label="Search help articles"
          />
        </label>
      </section>

      <div className="pilot-support-layout">
        <section className="pilot-support-articles-card" aria-label="Popular articles">
          <h2 className="pilot-support-card-title">POPULAR ARTICLES</h2>
          {articles.length === 0 ? (
            <p className="pilot-support-articles-empty">No articles match your search.</p>
          ) : (
            <ul className="pilot-support-articles-list">
              {articles.map((article) => (
                <li key={article.id}>
                  <Link
                    href={`/dashboard/pilot/support/articles/${article.slug}`}
                    className="pilot-support-article-row"
                  >
                    <span className="pilot-support-article-icon">
                      <ArticleIcon />
                    </span>
                    <span className="pilot-support-article-title">{article.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="pilot-support-sidebar">
          <section className="pilot-support-contact-card" aria-label="Contact Ground Control">
            <h2 className="pilot-support-card-title">CONTACT GROUND CONTROL</h2>
            <div className="pilot-support-contact-body">
              <button
                type="button"
                className="pilot-support-ticket-btn"
                onClick={() => openSupportChatWidget({ action: "new" })}
              >
                <ChatIcon />
                Open Support Ticket
              </button>
              <p className="pilot-support-contact-note">
                Average response: 4 hours · A-3 priority queue
              </p>
            </div>
          </section>

          <section className="pilot-support-tickets-card" aria-label="Open tickets">
            <h2 className="pilot-support-card-title">OPEN TICKETS</h2>
            {loadingChats ? (
              <p className="pilot-support-tickets-empty">Loading tickets…</p>
            ) : chatError ? (
              <p className="pilot-support-tickets-empty" role="alert">
                {chatError}
              </p>
            ) : openTickets.length === 0 ? (
              <p className="pilot-support-tickets-empty">No open tickets.</p>
            ) : (
              <ul className="pilot-support-tickets-list">
                {openTickets.map((chat) => (
                  <li key={chat.id}>
                    <button
                      type="button"
                      className="pilot-support-ticket-row"
                      onClick={() =>
                        openSupportChatWidget({ action: "open", chatId: chat.id })
                      }
                    >
                      <span className="pilot-support-ticket-row-copy">
                        <span className="pilot-support-ticket-row-title">
                          {ticketTitle(chat)}
                        </span>
                        <span className="pilot-support-ticket-row-meta">
                          #{formatSupportTicketId(chat.id)} ·{" "}
                          {SUPPORT_STATUS_LABELS[chat.status]} ·{" "}
                          {formatSupportMessageTime(chat.lastMessageAt)}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
