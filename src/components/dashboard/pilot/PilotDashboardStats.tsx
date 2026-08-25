import Link from "next/link";
import { PILOT_DASHBOARD_ROUTES } from "@/lib/pilot/dashboard-overview-mock";
import type { PilotDashboardPageData } from "@/lib/pilot/dashboard-page-data";

type PilotDashboardStatsProps = {
  stats: PilotDashboardPageData["stats"];
};

function formatCurrency(amount: number): string {
  return `$${Math.round(amount).toLocaleString()}`;
}

function pad2(value: number): string {
  return value.toString().padStart(2, "0");
}

export function PilotDashboardStats({ stats }: PilotDashboardStatsProps) {
  const cards = [
    {
      label: "TOTAL EARNINGS",
      value: formatCurrency(stats.totalEarnings),
      sub: `+${formatCurrency(stats.earningsThisMonth)} this month`,
      href: PILOT_DASHBOARD_ROUTES.earnings,
    },
    {
      label: "ACTIVE CONTRACTS",
      value: pad2(stats.activeContracts),
      sub:
        stats.contractsDueThisWeek > 0
          ? `${stats.contractsDueThisWeek} due this week`
          : "None due this week",
      href: PILOT_DASHBOARD_ROUTES.contracts,
    },
    {
      label: "PENDING PROPOSALS",
      value: pad2(stats.pendingProposals),
      sub:
        stats.shortlistedProposals > 0
          ? `${stats.shortlistedProposals} shortlisted`
          : stats.pendingProposals > 0
            ? "Awaiting client response"
            : "No open proposals",
      href: PILOT_DASHBOARD_ROUTES.proposals,
    },
    {
      label: "COMPLETED JOBS",
      value: String(stats.completedJobs),
      sub:
        stats.onTimeRatePct != null
          ? `${stats.onTimeRatePct}% on-time rate`
          : "Complete missions to track rate",
      href: PILOT_DASHBOARD_ROUTES.earnings,
    },
  ];

  return (
    <section className="pilot-dashboard-stats-grid" aria-label="Pilot statistics">
      {cards.map((card) => (
        <Link
          key={card.label}
          href={card.href}
          className="pilot-dashboard-stat-card pilot-dashboard-bracket-card"
        >
          <p className="pilot-dashboard-stat-label">{card.label}</p>
          <p className="pilot-dashboard-stat-value">{card.value}</p>
          <p className="pilot-dashboard-stat-sub">{card.sub}</p>
        </Link>
      ))}
    </section>
  );
}
