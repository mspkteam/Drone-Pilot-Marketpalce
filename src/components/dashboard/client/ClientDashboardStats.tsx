import {
  AppIcon,
  Bell,
  Briefcase,
  CircleCheck,
  Inbox,
  type LucideIcon,
} from "@/components/icons";
import type { ClientDashboardStat } from "@/lib/client/dashboard-overview";

type ClientDashboardStatsProps = {
  stats: ClientDashboardStat[];
};

const STAT_ICONS: Record<string, LucideIcon> = {
  "Active Projects": Briefcase,
  "Quotes Received": Inbox,
  "Projects Completed": CircleCheck,
  "Pending Actions": Bell,
};

function ClientStatCard({ stat }: { stat: ClientDashboardStat }) {
  const Icon = STAT_ICONS[stat.label] ?? Briefcase;

  return (
    <article className="client-dashboard-stat-card">
      <div className="client-dashboard-stat-head">
        <p className="client-dashboard-stat-label">{stat.label}</p>
        <span className="client-dashboard-stat-icon-wrap" aria-hidden>
          <AppIcon icon={Icon} className="client-dashboard-stat-icon" />
        </span>
      </div>
      <p className="client-dashboard-stat-value">{stat.value}</p>
      <p className="client-dashboard-stat-helper">{stat.helper}</p>
    </article>
  );
}

export function ClientDashboardStats({ stats }: ClientDashboardStatsProps) {
  return (
    <section className="client-dashboard-stats-grid" aria-label="Dashboard statistics">
      {stats.map((stat) => (
        <ClientStatCard key={stat.label} stat={stat} />
      ))}
    </section>
  );
}
