import { ClientDashboardCard } from "@/components/dashboard/client/ClientDashboardCard";
import { CLIENT_RECENT_ACTIVITY } from "@/lib/client/dashboard-overview-mock";

export function ClientDashboardRecentActivity() {
  return (
    <ClientDashboardCard
      title="Recent Activity"
      subtitle="Updates across your workspace"
      className="client-dashboard-card--tall"
    >
      <ul className="client-dashboard-activity-list">
        {CLIENT_RECENT_ACTIVITY.map((item) => (
          <li key={item.id} className="client-dashboard-activity-item">
            <span className="client-dashboard-activity-dot" aria-hidden />
            <div className="client-dashboard-activity-copy">
              <p className="client-dashboard-activity-main">
                <span className="client-dashboard-activity-actor">{item.actor}</span>{" "}
                {item.action}
              </p>
              <p className="client-dashboard-activity-sub">
                {item.project} · {item.timestamp}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </ClientDashboardCard>
  );
}
