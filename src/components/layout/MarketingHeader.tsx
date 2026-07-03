"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/layout/Logo";
import { getDashboardHomeForRole } from "@/lib/auth/permissions";
import { getVisibleMarketingNav, isMarketingNavActive } from "@/lib/navigation/marketing";
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
    : "mt-[20px] flex items-center gap-4";

  if (status === "loading") {
    return (
      <div className={cn(layoutClass, className)} aria-hidden>
        <span className="h-7 w-16 rounded bg-surface" />
        <span className="h-7 w-28 rounded bg-surface" />
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
      <Link
        href="/login"
        onClick={onNavigate}
        className="text-xs font-medium uppercase tracking-[0.12em] text-ras-text transition-colors hover:text-gold"
      >
        Log in
      </Link>
      <Link
        href="/register"
        onClick={onNavigate}
        className="inline-flex h-7 items-center rounded-md bg-gold px-6 text-xs font-bold uppercase tracking-[0.12em] text-ras-waitlist transition-colors hover:bg-gold-light"
      >
        Get Started
      </Link>
    </div>
  );
}

function NavLink({
  href,
  label,
  active,
  onNavigate,
  mobile = false,
}: {
  href: string;
  label: string;
  active: boolean;
  onNavigate?: () => void;
  mobile?: boolean;
}) {
  if (mobile) {
    return (
      <Link
        href={href}
        onClick={onNavigate}
        className={cn(
          "rounded-md px-3 py-2 text-sm",
          active
            ? "bg-gold/10 font-semibold text-gold"
            : "text-ras-warm hover:bg-surface hover:text-foreground",
        )}
      >
        {label}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={cn(
        "mt-[20px] border-b-2 pb-1.5 text-xs font-bold uppercase tracking-[0.12em] transition-colors",
        active
          ? "border-gold text-gold"
          : "border-transparent text-ras-warm hover:text-ras-text",
      )}
    >
      {label}
    </Link>
  );
}

export function MarketingHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const closeMenu = () => setOpen(false);
  const visibleNav = getVisibleMarketingNav();

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-border-muted)] bg-[var(--color-bg)]/95 backdrop-blur-md">
      <div className="public-container flex h-20 items-center justify-between gap-6">
        <Logo />
        <nav
          className="hidden items-center gap-8 lg:flex"
          aria-label="Main navigation"
        >
          {visibleNav.map((item) => (
            <NavLink
              key={item.href + item.label}
              href={item.href}
              label={item.label}
              active={isMarketingNavActive(pathname, item.match)}
            />
          ))}
        </nav>
        <HeaderAuthActions className="hidden lg:flex" />
        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-ras-border-muted lg:hidden"
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen(!open)}
        >
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
          "border-t border-ras-border-muted lg:hidden",
          open ? "block" : "hidden",
        )}
      >
        <nav className="flex flex-col gap-1 px-4 py-4" aria-label="Mobile navigation">
          {visibleNav.map((item) => (
            <NavLink
              key={item.href + item.label}
              href={item.href}
              label={item.label}
              active={isMarketingNavActive(pathname, item.match)}
              onNavigate={closeMenu}
              mobile
            />
          ))}
          <HeaderAuthActions
            stacked
            className="mt-3 border-t border-ras-border-muted pt-3"
            onNavigate={closeMenu}
          />
        </nav>
      </div>
    </header>
  );
}
