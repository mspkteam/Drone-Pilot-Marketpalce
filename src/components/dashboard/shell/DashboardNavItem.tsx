"use client";

import { DashboardNavIcon } from "@/components/dashboard/shell/DashboardNavIcon";
import { MessagesNavBadge } from "@/components/messaging/MessagesNavBadge";
import { useMilestoneAccess } from "@/contexts/MilestoneAccessContext";
import {
  evaluateMilestoneAccess,
  getNavHrefMilestone,
} from "@/lib/milestone-access";
import { getMilestoneBadgeLabel } from "@/lib/milestones";
import { cn } from "@/lib/utils";
import type { DashboardNavItem as NavItem } from "@/types/dashboard-nav";
import Link from "next/link";

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
  const { userRole, openLockedModal } = useMilestoneAccess();
  const access = evaluateMilestoneAccess(item.href, userRole);
  const locked =
    access.match != null &&
    !access.match.rule.alwaysUnlocked &&
    !access.allowed &&
    !access.bypassed;
  const milestoneNumber = getNavHrefMilestone(item.href);

  if (locked && access.match) {
    return (
      <button
        type="button"
        className={cn("dashboard-nav-item dashboard-nav-item--locked")}
        onClick={() => {
          openLockedModal(
            access.match!.rule.featureLabel,
            access.match!.rule.milestone,
          );
          onNavigate?.();
        }}
      >
        <DashboardNavIcon icon={item.icon} />
        <span className="min-w-0 flex-1 truncate text-left">{item.label}</span>
        {milestoneNumber ? (
          <span className="dashboard-nav-milestone-badge">
            {getMilestoneBadgeLabel(milestoneNumber)}
          </span>
        ) : (
          <span className="dashboard-nav-milestone-badge">Locked</span>
        )}
      </button>
    );
  }

  return (
    <Link
      href={item.href}
      className={cn(
        "dashboard-nav-item",
        active && "dashboard-nav-item--active",
        access.bypassed && "dashboard-nav-item--preview",
      )}
      onClick={onNavigate}
      title={
        access.bypassed
          ? "Milestone preview enabled for administrators"
          : undefined
      }
    >
      <DashboardNavIcon
        icon={item.icon}
        className={active ? "text-[var(--dash-gold)]" : undefined}
      />
      <span className="min-w-0 flex-1 truncate">{item.label}</span>
      {access.bypassed && milestoneNumber ? (
        <span className="dashboard-nav-milestone-badge dashboard-nav-milestone-badge--preview">
          Preview
        </span>
      ) : null}
      {item.href.includes("/messages") ? <MessagesNavBadge /> : null}
    </Link>
  );
}
