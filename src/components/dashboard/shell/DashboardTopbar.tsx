"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { NotificationBell } from "@/components/notifications/NotificationBell";

type DashboardTopbarProps = {
  sidebarCollapsed: boolean;
  onSidebarToggle: () => void;
};

export function DashboardTopbar({
  sidebarCollapsed,
  onSidebarToggle,
}: DashboardTopbarProps) {
  const router = useRouter();

  return (
    <header className="dashboard-topbar">
      <div className="flex min-w-0 items-center gap-2">
        <button
          type="button"
          className="dashboard-topbar-icon-btn"
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Toggle sidebar"}
          onClick={onSidebarToggle}
        >
          <SidebarToggleIcon />
        </button>
        <button
          type="button"
          className="dashboard-topbar-back"
          onClick={() => router.back()}
        >
          <BackIcon />
          <span>Back</span>
        </button>
      </div>
      <div className="ml-auto flex items-center">
        <NotificationBell indicator="dot" />
      </div>
    </header>
  );
}

function SidebarToggleIcon() {
  return (
    <Image
      src="/marketing/SVG (1)-collapsbel-icon.png"
      alt=""
      width={20}
      height={20}
      className="h-5 w-5 object-contain opacity-80"
      aria-hidden
    />
  );
}

function BackIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
    </svg>
  );
}
