"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { DashboardSidebar } from "@/components/dashboard/shell/DashboardSidebar";
import { DashboardTopbar } from "@/components/dashboard/shell/DashboardTopbar";
import { MilestoneRouteGuard } from "@/components/milestones/MilestoneRouteGuard";
import { MilestoneAccessProvider } from "@/contexts/MilestoneAccessContext";
import { cn } from "@/lib/utils";
import type {
  DashboardNavGroup,
  DashboardRankCardData,
  DashboardShellUser,
} from "@/types/dashboard-nav";
import type { UserRole } from "@/types/roles";

export type { DashboardNavGroup, DashboardShellUser, DashboardRankCardData };

const DESKTOP_NAV_MQ = "(min-width: 1024px)";

type DashboardShellProps = {
  homeHref: string;
  navGroups: readonly DashboardNavGroup[];
  user: DashboardShellUser;
  rankCard?: DashboardRankCardData | null;
  userRole?: UserRole;
  activeMilestone?: number;
  milestonePreviewEnabled?: boolean;
  children: React.ReactNode;
};

export function DashboardShell({
  homeHref,
  navGroups,
  user,
  rankCard = null,
  userRole,
  activeMilestone,
  milestonePreviewEnabled = false,
  children,
}: DashboardShellProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isDesktopNav, setIsDesktopNav] = useState(false);

  useEffect(() => {
    const desktop = window.matchMedia(DESKTOP_NAV_MQ);
    const sync = () => setIsDesktopNav(desktop.matches);
    sync();
    desktop.addEventListener("change", sync);
    return () => desktop.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!sidebarOpen || isDesktopNav) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSidebarOpen(false);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [sidebarOpen, isDesktopNav]);

  useEffect(() => {
    if (isDesktopNav) setSidebarOpen(false);
  }, [isDesktopNav]);

  const navExpanded = isDesktopNav ? !sidebarCollapsed : sidebarOpen;
  const navToggleLabel = isDesktopNav
    ? sidebarCollapsed
      ? "Expand sidebar"
      : "Collapse sidebar"
    : sidebarOpen
      ? "Close navigation"
      : "Open navigation";

  return (
    <MilestoneAccessProvider
      userRole={userRole}
      activeMilestone={activeMilestone}
      milestonePreviewEnabled={milestonePreviewEnabled}
    >
      <div
        className={cn(
          "dashboard-app min-h-screen",
          sidebarCollapsed && "dashboard-app--collapsed",
        )}
      >
        {sidebarOpen ? (
          <button
            type="button"
            className="dashboard-sidebar-overlay lg:hidden"
            aria-label="Close navigation"
            onClick={() => setSidebarOpen(false)}
          />
        ) : null}

        <DashboardSidebar
          open={sidebarOpen}
          collapsed={sidebarCollapsed}
          inert={!navExpanded}
          pathname={pathname}
          homeHref={homeHref}
          navGroups={navGroups}
          user={user}
          rankCard={rankCard}
          onClose={() => setSidebarOpen(false)}
        />

        <div className="dashboard-main-column">
          <DashboardTopbar
            navExpanded={navExpanded}
            navToggleLabel={navToggleLabel}
            onSidebarToggle={() => {
              if (window.matchMedia(DESKTOP_NAV_MQ).matches) {
                setSidebarCollapsed((v) => !v);
              } else {
                setSidebarOpen((v) => !v);
              }
            }}
          />
          <main className="dashboard-main">
            <div className="dashboard-canvas">
              <MilestoneRouteGuard
                userRole={userRole}
                dashboardHomeHref={homeHref}
              >
                {children}
              </MilestoneRouteGuard>
            </div>
          </main>
        </div>
      </div>
    </MilestoneAccessProvider>
  );
}
