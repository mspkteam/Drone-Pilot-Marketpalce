import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import {
  ActionCard,
  DashboardHero,
  DashboardModuleCard,
  DashboardPageLayout,
  IconChart,
  IconJobs,
  IconShield,
  IconUsers,
  StatCard,
} from "@/components/dashboard";
import { getAdminOverviewStats } from "@/lib/admin/stats";
import { DEFAULT_COMMISSION_RATE } from "@/lib/commission/constants";
import { isAdminRole, type UserRole } from "@/types/roles";

export const metadata = { title: "Admin Dashboard" };

export default async function AdminDashboardPage() {
  const session = await auth();
  const role = session?.user?.role as UserRole | undefined;
  if (!session?.user?.id || !role || !isAdminRole(role)) {
    redirect("/login");
  }

  const stats = await getAdminOverviewStats();

  const statCards = [
    {
      label: "Jobs pending approval",
      value: String(stats.pendingJobs),
      icon: <IconJobs className="h-5 w-5" />,
      href: "/dashboard/admin/jobs",
    },
    {
      label: "Pilots pending review",
      value: String(stats.pendingPilots),
      icon: <IconUsers className="h-5 w-5" />,
      href: "/dashboard/admin/pilots",
    },
    {
      label: "Verifications pending",
      value: String(stats.pendingVerifications),
      icon: <IconShield className="h-5 w-5" />,
      href: "/dashboard/admin/verifications",
    },
    {
      label: "Active disputes",
      value: String(stats.activeDisputes),
      icon: <IconShield className="h-5 w-5" />,
      href: "/dashboard/admin/disputes",
    },
    {
      label: "Open jobs",
      value: String(stats.openJobs),
      icon: <IconJobs className="h-5 w-5" />,
      href: "/dashboard/admin/jobs",
    },
    {
      label: "Active bookings",
      value: String(stats.activeBookings),
      icon: <IconChart className="h-5 w-5" />,
      href: "/dashboard/admin/bookings",
    },
    {
      label: "Platform users",
      value: String(stats.totalUsers),
      icon: <IconUsers className="h-5 w-5" />,
      href: role === "super_admin" ? "/dashboard/admin/users" : undefined,
      helperText: `${stats.totalPilots} pilots · ${stats.totalClients} clients`,
    },
    {
      label: "Completed bookings",
      value: String(stats.completedBookings),
      icon: <IconChart className="h-5 w-5" />,
      href: "/dashboard/admin/bookings",
    },
    {
      label: "Commission recorded",
      value: `USD ${stats.totalCommission.toLocaleString()}`,
      icon: <IconChart className="h-5 w-5" />,
      href: "/dashboard/admin/payments",
      helperText: `${(DEFAULT_COMMISSION_RATE * 100).toFixed(0)}% rate`,
    },
    {
      label: "Waitlist subscribers",
      value: String(stats.waitlistSubscribers),
      icon: <IconUsers className="h-5 w-5" />,
      href: "/dashboard/admin/waitlist",
    },
  ];

  const quickLinks = [
    { label: "Waitlist", href: "/dashboard/admin/waitlist" },
    { label: "Verifications", href: "/dashboard/admin/verifications" },
    { label: "Disputes", href: "/dashboard/admin/disputes" },
    { label: "Messages", href: "/dashboard/admin/messages" },
    { label: "Applications", href: "/dashboard/admin/applications" },
    { label: "Reviews", href: "/dashboard/admin/reviews" },
    { label: "Payments", href: "/dashboard/admin/payments" },
    ...(role === "super_admin"
      ? [{ label: "Settings", href: "/dashboard/admin/settings" }]
      : []),
  ];

  return (
    <DashboardPageLayout>
      <DashboardHero
        eyebrow="Admin dashboard"
        title="Operations overview"
        description="Platform health — users, jobs, bookings, verifications, and payouts."
      />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
        {statCards.map((card) => (
          <StatCard
            key={card.label}
            label={card.label}
            value={card.value}
            icon={card.icon}
            href={card.href}
            helperText={card.helperText}
          />
        ))}
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:gap-6">
        <DashboardModuleCard
          title="Priority queues"
          icon={<IconShield className="h-5 w-5" />}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <ActionCard
              title="Review jobs"
              description={`${stats.pendingJobs} job(s) awaiting approval.`}
              href="/dashboard/admin/jobs"
              ctaLabel="Open queue"
              icon={<IconJobs className="h-5 w-5" />}
            />
            <ActionCard
              title="Review pilots"
              description={`${stats.pendingPilots} pilot profile(s) in queue.`}
              href="/dashboard/admin/pilots"
              ctaLabel="Open queue"
              icon={<IconUsers className="h-5 w-5" />}
            />
          </div>
        </DashboardModuleCard>

        <DashboardModuleCard
          title="Quick links"
          icon={<IconChart className="h-5 w-5" />}
        >
          <ul className="grid gap-2 sm:grid-cols-2">
            {quickLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="block rounded-lg border border-border bg-surface/50 px-4 py-3 text-sm font-medium text-gold-light transition-colors hover:border-gold/40 hover:bg-gold/5"
                >
                  {link.label} →
                </Link>
              </li>
            ))}
          </ul>
        </DashboardModuleCard>
      </div>
    </DashboardPageLayout>
  );
}
