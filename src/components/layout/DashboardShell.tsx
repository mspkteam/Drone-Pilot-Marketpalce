"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { DashboardSidebar } from "@/components/dashboard/shell/DashboardSidebar";
import { DashboardTopbar } from "@/components/dashboard/shell/DashboardTopbar";
import { cn } from "@/lib/utils";
import type {
  DashboardNavGroup,
  DashboardRankCardData,
  DashboardShellUser,
} from "@/types/dashboard-nav";

export type { DashboardNavGroup, DashboardShellUser, DashboardRankCardData };

type DashboardShellProps = {
  homeHref: string;
  navGroups: readonly DashboardNavGroup[];
  user: DashboardShellUser;
  rankCard?: DashboardRankCardData | null;
  children: React.ReactNode;
};

export function DashboardShell({
  homeHref,
  navGroups,
  user,
  rankCard = null,
  children,
}: DashboardShellProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
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
        pathname={pathname}
        homeHref={homeHref}
        navGroups={navGroups}
        user={user}
        rankCard={rankCard}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="dashboard-main-column">
        <DashboardTopbar
          sidebarCollapsed={sidebarCollapsed}
          onSidebarToggle={() => {
            if (typeof window !== "undefined" && window.matchMedia("(min-width: 1024px)").matches) {
              setSidebarCollapsed((v) => !v);
            } else {
              setSidebarOpen((v) => !v);
            }
          }}
        />
        <main className="dashboard-main">
          <div className="dashboard-canvas">{children}</div>
        </main>
      </div>
    </div>
  );
}
