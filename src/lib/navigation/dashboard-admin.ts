import type { DashboardNavGroup } from "@/types/dashboard-nav";

/**
 * Admin / moderator sidebar — product module list (design pass pending).
 * Routes for pilots, clients, waitlist, verifications, applications, and bookings
 * remain available; they will fold into module hubs during the UI pass.
 */
export const adminNavGroups: readonly DashboardNavGroup[] = [
  {
    label: "Command",
    items: [
      { label: "Dashboard", href: "/dashboard/admin", icon: "dashboard" },
      { label: "Reports", href: "/dashboard/admin/reports", icon: "reports" },
    ],
  },
  {
    label: "Users",
    items: [
      { label: "All Users", href: "/dashboard/admin/users", icon: "users" },
    ],
  },
  {
    label: "Operations",
    items: [
      { label: "Job Approval", href: "/dashboard/admin/jobs", icon: "jobs" },
      { label: "Messages", href: "/dashboard/admin/messages", icon: "messages" },
      {
        label: "Support Chat",
        href: "/dashboard/admin/support",
        icon: "support",
      },
      { label: "Disputes", href: "/dashboard/admin/disputes", icon: "disputes" },
    ],
  },
  {
    label: "Finance",
    items: [
      {
        label: "Subscriptions",
        href: "/dashboard/admin/subscriptions",
        icon: "subscriptions",
      },
      {
        label: "Commissions",
        href: "/dashboard/admin/payments",
        icon: "payments",
      },
    ],
  },
  {
    label: "Compliance",
    items: [
      {
        label: "Certificates",
        href: "/dashboard/admin/certificates",
        icon: "certificates",
      },
      {
        label: "Badges & Wings",
        href: "/dashboard/admin/achievements",
        icon: "achievements",
      },
    ],
  },
  {
    label: "Commerce",
    items: [
      { label: "Uniform Shop", href: "/dashboard/admin/shop", icon: "shop" },
    ],
  },
  {
    label: "Content",
    items: [{ label: "CMS", href: "/dashboard/admin/cms", icon: "cms" }],
  },
  {
    label: "Account",
    items: [
      {
        label: "Permissions",
        href: "/dashboard/admin/permissions",
        icon: "settings",
      },
      { label: "Configuration", href: "/dashboard/admin/settings", icon: "settings" },
    ],
  },
] as const;

export const adminNav = adminNavGroups.flatMap((g) => g.items);
