import {
  CLIENT_DASHBOARD_STATS,
  type ClientDashboardStat,
} from "@/lib/client/dashboard-overview-mock";

function ClientStatCard({ stat }: { stat: ClientDashboardStat }) {
  return (
    <article className="client-dashboard-stat-card">
      <p className="client-dashboard-stat-label">{stat.label}</p>
      <p className="client-dashboard-stat-value">{stat.value}</p>
      <p className="client-dashboard-stat-helper">{stat.helper}</p>
    </article>
  );
}

export function ClientDashboardStats() {
  return (
    <section className="client-dashboard-stats-grid" aria-label="Dashboard statistics">
      {CLIENT_DASHBOARD_STATS.map((stat) => (
        <ClientStatCard key={stat.label} stat={stat} />
      ))}
    </section>
  );
}
