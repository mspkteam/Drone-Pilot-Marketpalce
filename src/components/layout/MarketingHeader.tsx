"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/layout/Logo";
import { getDashboardHomeForRole } from "@/lib/auth/permissions";
import { marketingNav } from "@/lib/navigation/marketing";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types/roles";

function HeaderAuthActions({
  className,
  stacked = false,
  onNavigate,
}: {
  className?: string;
  stacked?: boolean;
  onNavigate?: () => void;
}) {
  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated" && !!session?.user;

  const layoutClass = stacked
    ? "flex w-full flex-col gap-2 [&_a]:w-full [&_button]:w-full"
    : "flex items-center gap-3";

  if (status === "loading") {
    return (
      <div className={cn(layoutClass, className)} aria-hidden>
        <span className="h-9 w-full rounded-md bg-surface sm:w-16" />
        <span className="h-9 w-full rounded-md bg-surface sm:w-24" />
      </div>
    );
  }

  if (isLoggedIn && session.user.role) {
    const dashboardHref = getDashboardHomeForRole(
      session.user.role as UserRole,
    );

    return (
      <div className={cn(layoutClass, className)}>
        <Button
          href={dashboardHref}
          variant="ghost"
          size="sm"
          onClick={onNavigate}
        >
          Dashboard
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={() => {
            onNavigate?.();
            void signOut({ callbackUrl: "/" });
          }}
        >
          Sign out
        </Button>
      </div>
    );
  }

  return (
    <div className={cn(layoutClass, className)}>
      <Button href="/login" variant="ghost" size="sm" onClick={onNavigate}>
        Log in
      </Button>
      <Button href="/register" size="sm" onClick={onNavigate}>
        Get started
      </Button>
    </div>
  );
}

export function MarketingHeader() {
  const [open, setOpen] = useState(false);
  const closeMenu = () => setOpen(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo />
        <nav
          className="hidden items-center gap-6 md:flex"
          aria-label="Main navigation"
        >
          {marketingNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-muted-foreground transition-colors hover:text-gold-light"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <HeaderAuthActions className="hidden md:flex" />
        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border md:hidden"
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen(!open)}
        >
          <span className="sr-only">Menu</span>
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden
          >
            {open ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>
      <div
        className={cn(
          "border-t border-border md:hidden",
          open ? "block" : "hidden",
        )}
      >
        <nav className="flex flex-col gap-1 px-4 py-4" aria-label="Mobile navigation">
          {marketingNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm hover:bg-surface"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <HeaderAuthActions
            stacked
            className="mt-3 border-t border-border pt-3"
            onNavigate={closeMenu}
          />
        </nav>
      </div>
    </header>
  );
}
