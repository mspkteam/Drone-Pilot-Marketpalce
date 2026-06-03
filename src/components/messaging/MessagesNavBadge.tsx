"use client";

import { useEffect, useState } from "react";

export function MessagesNavBadge() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/messages/unread-count");
        const data = await res.json();
        if (!data.error) setCount(data.unreadCount ?? 0);
      } catch {
        /* ignore */
      }
    }
    void load();
    const interval = setInterval(load, 45_000);
    return () => clearInterval(interval);
  }, []);

  if (count <= 0) return null;

  return (
    <span className="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-gold px-1.5 text-[10px] font-semibold text-gold-dark">
      {count > 99 ? "99+" : count}
    </span>
  );
}
