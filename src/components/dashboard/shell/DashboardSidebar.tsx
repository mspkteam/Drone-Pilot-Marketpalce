"use client";

import Image from "next/image";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { DashboardNavGroup } from "@/components/dashboard/shell/DashboardNavGroup";
import { DashboardRankCard } from "@/components/dashboard/shell/DashboardRankCard";
import { DashboardUserCard } from "@/components/dashboard/shell/DashboardUserCard";
import { homeAssets } from "@/lib/marketing/home-assets";
import { cn } from "@/lib/utils";
import type {
  DashboardNavGroup as NavGroup,
  DashboardRankCardData,
  DashboardShellUser,
} from "@/types/dashboard-nav";

type DashboardSidebarProps = {
  open: boolean;
  collapsed: boolean;
  pathname: string;
  homeHref: string;
  navGroups: readonly NavGroup[];
  user: DashboardShellUser;
  rankCard?: DashboardRankCardData | null;
  onClose: () => void;
};

export function DashboardSidebar({
  open,
  collapsed,
  pathname,
  homeHref,
  navGroups,
  user,
  rankCard,
  onClose,
}: DashboardSidebarProps) {
  return (
    <aside
      className={cn(
        "dashboard-sidebar",
        open ? "dashboard-sidebar--open" : "dashboard-sidebar--closed",
        collapsed && "dashboard-sidebar--collapsed",
      )}
      aria-label="Dashboard navigation"
    >
      <div className="dashboard-sidebar-inner">
        <div className="dashboard-sidebar-logo">
          <Link
            href="/"
            className="dashboard-sidebar-logo-link"
            aria-label="Remote Air Service — home"
            onClick={onClose}
          >
            <Image
              src={homeAssets.logo}
              alt=""
              width={80}
              height={80}
              className="dashboard-sidebar-logo-img"
            />
          </Link>
        </div>

        {rankCard ? <DashboardRankCard data={rankCard} /> : null}

        <nav className="dashboard-sidebar-nav">
          {navGroups.map((group) => (
            <DashboardNavGroup
              key={group.label}
              group={group}
              pathname={pathname}
              homeHref={homeHref}
              onNavigate={onClose}
            />
          ))}
        </nav>

        <div className="dashboard-sidebar-footer">
          <DashboardUserCard user={user} />
          <button
            type="button"
            className="dashboard-sidebar-signout"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            Sign out
          </button>
        </div>
      </div>
    </aside>
  );
}
