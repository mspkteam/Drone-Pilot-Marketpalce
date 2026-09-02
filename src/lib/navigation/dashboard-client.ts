import type { DashboardNavGroup } from "@/types/dashboard-nav";

/** Client cockpit sidebar — Figma page `69:1732` (Workspace + Account). */
export const clientNavGroups: readonly DashboardNavGroup[] = [
  {
    label: "Workspace",
    items: [
      { label: "Dashboard", href: "/dashboard/client", icon: "dashboard" },
      {
        label: "Post a Project",
        href: "/dashboard/client/jobs/new",
        icon: "jobs",
      },
      {
        label: "My Projects",
        href: "/dashboard/client/jobs",
        icon: "marketplace",
        activeExclude: ["/dashboard/client/jobs/new"],
      },
      {
        label: "Project Quotes",
        href: "/dashboard/client/quotes",
        icon: "proposals",
      },
      {
        label: "Find Pilots",
        href: "/dashboard/client/find-pilots",
        icon: "pilots",
      },
      {
        label: "Bookings",
        href: "/dashboard/client/bookings",
        icon: "bookings",
      },
      {
        label: "Disputes",
        href: "/dashboard/client/disputes",
        icon: "disputes",
      },
    ],
  },
  {
    label: "Account",
    items: [
      { label: "Messages", href: "/dashboard/client/messages", icon: "messages" },
      { label: "Profile", href: "/dashboard/client/profile", icon: "profile" },
      {
        label: "Billing",
        href: "/dashboard/client/payments",
        icon: "payments",
      },
      { label: "Settings", href: "/dashboard/client/settings", icon: "settings" },
    ],
  },
] as const;

export const clientNav = clientNavGroups.flatMap((g) => g.items);
