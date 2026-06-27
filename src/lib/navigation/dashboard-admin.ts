import type { DashboardNavGroup } from "@/types/dashboard-nav";

/**
 * Admin / moderator sidebar — Figma section `808:24076` (flat nav list).
 * Permissions is super-admin only. Messages and support remain routable but off Figma IA.
 */
export const adminNavGroups: readonly DashboardNavGroup[] = [
  {
    label: "Navigation",
    hideLabel: true,
    items: [
      { label: "Dashboard", href: "/dashboard/admin", icon: "dashboard" },
      { label: "Users", href: "/dashboard/admin/users", icon: "users" },
      {
        label: "Remote Aviator Verification",
        href: "/dashboard/admin/verifications",
        icon: "verification",
      },
      { label: "Job Approval", href: "/dashboard/admin/jobs", icon: "jobs" },
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
      { label: "Disputes", href: "/dashboard/admin/disputes", icon: "disputes" },
      {
        label: "Squadron Voting",
        href: "/dashboard/admin/squadron-voting",
        icon: "disputes",
      },
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
      { label: "Uniform Shop", href: "/dashboard/admin/shop", icon: "shop" },
      { label: "Regions", href: "/dashboard/admin/regions", icon: "settings" },
      { label: "Reports", href: "/dashboard/admin/reports", icon: "reports" },
      { label: "CMS Pages", href: "/dashboard/admin/cms", icon: "cms" },
      {
        label: "Permissions",
        href: "/dashboard/admin/permissions",
        icon: "permissions",
      },
      { label: "Settings", href: "/dashboard/admin/settings", icon: "settings" },
    ],
  },
] as const;

export const adminNav = adminNavGroups.flatMap((g) => g.items);
