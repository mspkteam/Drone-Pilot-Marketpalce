"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { DashboardUserMenu } from "@/components/layout/DashboardUserMenu";
import { MessagesNavBadge } from "@/components/messaging/MessagesNavBadge";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { Logo } from "@/components/layout/Logo";
import { cn } from "@/lib/utils";

export type NavItem = { label: string; href: string };

type DashboardShellProps = {
  roleLabel: string;
  navItems: readonly NavItem[];
  children: React.ReactNode;
};

export function DashboardShell({
  roleLabel,
  navItems,
  children,
}: DashboardShellProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile overlay */}
      {sidebarOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-transform lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center border-b border-sidebar-border px-4">
          <Logo variant="light" />
        </div>
        <p className="px-4 py-2 text-xs font-medium uppercase tracking-wider text-gold">
          {roleLabel}
        </p>
        <nav className="flex-1 overflow-y-auto px-2 py-2" aria-label="Dashboard">
          <ul className="space-y-0.5">
            {navItems.map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== navItems[0].href &&
                  pathname.startsWith(item.href));
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "block rounded-md px-3 py-2 text-sm transition-colors",
                      active
                        ? "border border-gold/25 bg-gold/15 font-medium text-gold-light shadow-[0_0_12px_rgba(201,162,39,0.12)]"
                        : "text-sidebar-muted hover:border hover:border-white/5 hover:bg-white/5 hover:text-sidebar-foreground",
                    )}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <span className="flex w-full items-center gap-2">
                      {item.label}
                      {item.href.includes("/messages") ? (
                        <MessagesNavBadge />
                      ) : null}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="border-t border-sidebar-border p-4">
          <Link
            href="/"
            className="text-xs text-sidebar-muted hover:text-sidebar-foreground"
          >
            ← Back to site
          </Link>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-surface/90 px-4 backdrop-blur-md lg:px-6">
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border lg:hidden"
            aria-label="Open sidebar"
            onClick={() => setSidebarOpen(true)}
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <p className="text-sm text-muted-foreground lg:hidden">{roleLabel}</p>
          <div className="ml-auto flex items-center gap-2">
            <NotificationBell />
            <DashboardUserMenu />
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
