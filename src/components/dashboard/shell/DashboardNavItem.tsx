"use client";

import Link from "next/link";
import { MessagesNavBadge } from "@/components/messaging/MessagesNavBadge";
import { DashboardNavIcon } from "@/components/dashboard/shell/DashboardNavIcon";
import { cn } from "@/lib/utils";
import type { DashboardNavItem as NavItem } from "@/types/dashboard-nav";

type DashboardNavItemProps = {
  item: NavItem;
  active: boolean;
  onNavigate?: () => void;
};

export function DashboardNavItem({
  item,
  active,
  onNavigate,
}: DashboardNavItemProps) {
  return (
    <Link
      href={item.href}
      className={cn(
        "dashboard-nav-item",
        active && "dashboard-nav-item--active",
      )}
      onClick={onNavigate}
    >
      <DashboardNavIcon
        icon={item.icon}
        className={active ? "text-[var(--dash-gold)]" : undefined}
      />
      <span className="min-w-0 flex-1 truncate">{item.label}</span>
      {item.href.includes("/messages") ? <MessagesNavBadge /> : null}
    </Link>
  );
}
