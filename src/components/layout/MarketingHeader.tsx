"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/layout/Logo";
import { brandClasses } from "@/lib/design/brand";
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
    : "ras-marketing-header-actions";

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
        className={brandClasses.marketingHeaderLogin}
      >
        Log in
      </Link>
      <Link
        href="/register"
        onClick={onNavigate}
        className={brandClasses.marketingHeaderCta}
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
        brandClasses.marketingHeaderNavLink,
        active && "ras-marketing-header-nav-link--active",
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
      <div className="public-container grid h-20 grid-cols-[1fr_auto_1fr] items-center gap-6">
        <div className="flex items-center justify-self-start">
          <Logo />
        </div>
        <nav
          className="ras-marketing-header-nav hidden justify-center lg:flex"
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
        <div className="flex items-center justify-self-end">
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
