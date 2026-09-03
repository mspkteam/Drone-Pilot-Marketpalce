"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import type { NotificationDto } from "@/types/notification";
import { cn } from "@/lib/utils";

type NotificationBellProps = {
  /** Dashboard topbar uses a small gold dot per Figma 361:911. */
  indicator?: "count" | "dot";
  className?: string;
};

export function NotificationBell({
  indicator = "count",
  className,
}: NotificationBellProps = {}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const load = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    try {
      const res = await fetch("/api/notifications", {
        signal: controller.signal,
        cache: "no-store",
      });
      if (!res.ok) return;

      const data = (await res.json()) as {
        error?: string;
        notifications?: NotificationDto[];
        unreadCount?: number;
      };
      if (data.error) return;

      setNotifications(data.notifications ?? []);
      setUnreadCount(data.unreadCount ?? 0);
    } catch (error) {
      // Network blips, HMR restarts, and unmount aborts are expected in dev.
      if (error instanceof DOMException && error.name === "AbortError") return;
      if (process.env.NODE_ENV === "development") {
        console.warn("[NotificationBell] load failed:", error);
      }
    } finally {
      if (abortRef.current === controller) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    void load();
    const interval = setInterval(() => {
      void load();
    }, 60_000);
    return () => {
      clearInterval(interval);
      abortRef.current?.abort();
    };
  }, [load]);

  async function markRead(id: string) {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: "POST" });
      await load();
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.warn("[NotificationBell] markRead failed:", error);
      }
    }
  }

  async function markAllRead() {
    try {
      await fetch("/api/notifications", { method: "POST" });
      await load();
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.warn("[NotificationBell] markAllRead failed:", error);
      }
    }
  }

  async function handleNotificationClick(n: NotificationDto) {
    if (!n.readAt) {
      await markRead(n.id);
    }
    if (n.href) {
      setOpen(false);
      router.push(n.href);
    }
  }

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        className={cn(
          "relative inline-flex h-10 w-10 items-center justify-center rounded-md border border-border hover:bg-surface",
          indicator === "dot" && "dashboard-topbar-bell",
        )}
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
        onClick={() => {
          setOpen((o) => !o);
          if (!open) void load();
        }}
      >
        <svg
          className="h-5 w-5 text-muted-foreground"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 ? (
          indicator === "dot" ? (
            <span className="dashboard-topbar-notify-dot" aria-hidden />
          ) : (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[10px] font-bold text-black">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )
        ) : indicator === "count" ? (
          <span
            className="absolute -right-0.5 -top-0.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full border border-border bg-background px-1 text-[8px] font-semibold text-muted-foreground"
            aria-hidden
          >
            0
          </span>
        ) : null}
      </button>

      {open ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40"
            aria-label="Close notifications"
            onClick={() => setOpen(false)}
          />
          <div
            className="absolute right-0 z-50 mt-2 w-[min(20rem,calc(100vw-2rem))] rounded-lg border border-border bg-background shadow-lg"
            role="dialog"
            aria-label="Notifications"
          >
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <p className="text-sm font-semibold">Notifications</p>
              <button
                  type="button"
                  className="text-xs text-gold-dark hover:text-gold disabled:opacity-50"
                  disabled={unreadCount === 0}
                  onClick={() => void markAllRead()}
                >
                  Mark all read
                </button>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {loading && notifications.length === 0 ? (
                <p className="px-4 py-6 text-sm text-muted-foreground">Loading…</p>
              ) : notifications.length === 0 ? (
                <p className="px-4 py-6 text-sm text-muted-foreground">
                  No notifications yet.
                </p>
              ) : (
                <ul>
                  {notifications.map((n) => (
                    <li
                      key={n.id}
                      className={cn(
                        "border-b border-border last:border-0",
                        !n.readAt && "bg-gold/5",
                      )}
                    >
                      <button
                        type="button"
                        className={cn(
                          "w-full px-4 py-3 text-left text-sm transition-colors hover:bg-surface",
                          n.href && "cursor-pointer",
                        )}
                        onClick={() => void handleNotificationClick(n)}
                      >
                        <p className="font-medium">{n.title}</p>
                        <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                          {n.body}
                        </p>
                        <p className="mt-1 flex items-center justify-between gap-2 text-[10px] text-muted-foreground">
                          <span>{new Date(n.createdAt).toLocaleString()}</span>
                          {n.href ? (
                            <span className="text-gold-dark">View →</span>
                          ) : null}
                        </p>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
