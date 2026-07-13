"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
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

  // Close on Escape, and auto-close when the viewport grows to the desktop
  // breakpoint (so a menu opened on mobile doesn't linger after resize/rotate).
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const desktop = window.matchMedia("(min-width: 1024px)");
    const onDesktopChange = () => {
      if (desktop.matches) setOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    desktop.addEventListener("change", onDesktopChange);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      desktop.removeEventListener("change", onDesktopChange);
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-border-muted)] bg-[var(--color-bg)]/95 backdrop-blur-md">
      <div className="public-container flex h-20 items-center justify-between gap-4 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:gap-6">
        <div className="flex items-center lg:justify-self-start">
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
        <div className="flex items-center lg:justify-self-end">
          <HeaderAuthActions className="hidden lg:flex" />
          <button
            type="button"
            className="group inline-flex h-10 w-10 items-center justify-center rounded-md border border-ras-border-muted text-foreground transition-colors hover:border-gold/50 hover:text-gold active:scale-95 lg:hidden"
            aria-expanded={open}
            aria-controls="marketing-mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            <span className="relative block h-4 w-5" aria-hidden>
              <span
                className={cn(
                  "absolute left-0 h-0.5 w-5 rounded-full bg-current transition-all duration-300 ease-out",
                  open ? "top-1/2 -translate-y-1/2 rotate-45" : "top-0",
                )}
              />
              <span
                className={cn(
                  "absolute left-0 top-1/2 h-0.5 w-5 -translate-y-1/2 rounded-full bg-current transition-all duration-300 ease-out",
                  open ? "opacity-0" : "opacity-100",
                )}
              />
              <span
                className={cn(
                  "absolute left-0 h-0.5 w-5 rounded-full bg-current transition-all duration-300 ease-out",
                  open ? "bottom-1/2 translate-y-1/2 -rotate-45" : "bottom-0",
                )}
              />
            </span>
          </button>
        </div>
      </div>

      {/* Tap-outside scrim (mouse convenience; keyboard users use Escape) */}
      <button
        type="button"
        aria-hidden
        tabIndex={-1}
        onClick={closeMenu}
        className={cn(
          "fixed inset-x-0 bottom-0 top-20 z-40 bg-black/40 transition-opacity duration-300 lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      <div
        id="marketing-mobile-menu"
        inert={!open}
        aria-hidden={!open}
        className={cn(
          "absolute inset-x-0 top-full z-50 grid overflow-hidden border-b border-ras-border-muted bg-[var(--color-bg)] shadow-xl transition-all duration-300 ease-out lg:hidden",
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <nav
            className="flex flex-col gap-1 px-4 py-4"
            aria-label="Mobile navigation"
          >
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
      </div>
    </header>
  );
}
