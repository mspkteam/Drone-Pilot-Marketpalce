import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
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

  const cards = [
    {
      label: "Jobs pending approval",
      value: stats.pendingJobs,
      href: "/dashboard/admin/jobs",
      cta: "Review jobs",
    },
    {
      label: "Pilots pending review",
      value: stats.pendingPilots,
      href: "/dashboard/admin/pilots",
      cta: "Review pilots",
    },
    {
      label: "Verifications pending",
      value: stats.pendingVerifications,
      href: "/dashboard/admin/verifications",
      cta: "Review verifications",
    },
    {
      label: "Active disputes",
      value: stats.activeDisputes,
      href: "/dashboard/admin/disputes",
      cta: "Review disputes",
    },
    {
      label: "Open jobs",
      value: stats.openJobs,
      href: "/dashboard/admin/jobs",
      cta: "View jobs",
    },
    {
      label: "Active bookings",
      value: stats.activeBookings,
      href: "/dashboard/admin/bookings",
      cta: "View bookings",
    },
    {
      label: "Platform users",
      value: stats.totalUsers,
      href: role === "super_admin" ? "/dashboard/admin/users" : undefined,
      sub: `${stats.totalPilots} pilots · ${stats.totalClients} clients`,
    },
    {
      label: "Completed bookings",
      value: stats.completedBookings,
      href: "/dashboard/admin/bookings",
    },
    {
      label: "Commission recorded",
      value: `USD ${stats.totalCommission.toLocaleString()}`,
      href: "/dashboard/admin/payments",
      sub: `${(DEFAULT_COMMISSION_RATE * 100).toFixed(0)}% rate`,
    },
    {
      label: "Waitlist subscribers",
      value: stats.waitlistSubscribers,
      href: "/dashboard/admin/waitlist",
      cta: "View waitlist",
    },
  ];

  return (
    <>
      <PageHeader
        badge="Admin"
        title="Dashboard"
        description="Platform overview — users, jobs, bookings, and operations."
      />

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <div
            key={card.label}
            className="stat-card"
          >
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {card.label}
            </p>
            <p className="mt-2 text-3xl font-semibold">{card.value}</p>
            {card.sub ? (
              <p className="mt-1 text-sm text-muted-foreground">{card.sub}</p>
            ) : null}
            {card.href && card.cta ? (
              <Button href={card.href} size="sm" className="mt-4">
                {card.cta}
              </Button>
            ) : card.href ? (
              <Link
                href={card.href}
                className="mt-4 inline-block text-sm font-medium text-gold-dark hover:text-gold"
              >
                View →
              </Link>
            ) : null}
          </div>
        ))}
      </div>

      <div className="mt-8 premium-card p-5">
        <p className="text-sm font-medium">Quick links</p>
        <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm">
          <li>
            <Link
              href="/dashboard/admin/waitlist"
              className="text-gold-dark hover:text-gold"
            >
              Waitlist
            </Link>
          </li>
          <li>
            <Link
              href="/dashboard/admin/verifications"
              className="text-gold-dark hover:text-gold"
            >
              Verifications
            </Link>
          </li>
          <li>
            <Link
              href="/dashboard/admin/disputes"
              className="text-gold-dark hover:text-gold"
            >
              Disputes
            </Link>
          </li>
          <li>
            <Link
              href="/dashboard/admin/messages"
              className="text-gold-dark hover:text-gold"
            >
              Messages
            </Link>
          </li>
          <li>
            <Link
              href="/dashboard/admin/applications"
              className="text-gold-dark hover:text-gold"
            >
              Applications
            </Link>
          </li>
          <li>
            <Link
              href="/dashboard/admin/reviews"
              className="text-gold-dark hover:text-gold"
            >
              Reviews
            </Link>
          </li>
          <li>
            <Link
              href="/dashboard/admin/payments"
              className="text-gold-dark hover:text-gold"
            >
              Payments
            </Link>
          </li>
          {role === "super_admin" ? (
            <li>
              <Link
                href="/dashboard/admin/settings"
                className="text-gold-dark hover:text-gold"
              >
                Settings
              </Link>
            </li>
          ) : null}
        </ul>
      </div>
    </>
  );
}
