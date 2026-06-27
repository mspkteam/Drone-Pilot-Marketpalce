import { ClientDashboardCard } from "@/components/dashboard/client/ClientDashboardCard";
import type { ClientActivityItem } from "@/lib/client/dashboard-overview";

type ClientDashboardRecentActivityProps = {
  activity: ClientActivityItem[];
};

export function ClientDashboardRecentActivity({
  activity,
}: ClientDashboardRecentActivityProps) {
  return (
    <ClientDashboardCard
      title="Recent Activity"
      subtitle="Updates across your workspace"
      className="client-dashboard-card--tall"
    >
      {activity.length === 0 ? (
        <p className="client-dashboard-empty-copy" role="status">
          No recent activity yet. Updates from bids, approvals, and messages will
          appear here.
        </p>
      ) : (
        <ul className="client-dashboard-activity-list">
          {activity.map((item) => (
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
      )}
    </ClientDashboardCard>
  );
}
