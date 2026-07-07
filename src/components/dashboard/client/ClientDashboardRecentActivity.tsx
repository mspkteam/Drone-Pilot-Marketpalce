import {
  AppIcon,
  Circle,
  CircleCheck,
  FileText,
  MessageSquare,
  Upload,
  type LucideIcon,
} from "@/components/icons";
import { ClientDashboardCard } from "@/components/dashboard/client/ClientDashboardCard";
import type { ClientActivityItem } from "@/lib/client/dashboard-overview";

type ClientDashboardRecentActivityProps = {
  activity: ClientActivityItem[];
};

function activityIcon(item: ClientActivityItem): LucideIcon {
  const action = item.action.toLowerCase();

  if (action.includes("message")) return MessageSquare;
  if (action.includes("upload")) return Upload;
  if (action.includes("completed")) return CircleCheck;
  if (action.includes("proposal") || action.includes("quote")) return FileText;

  return Circle;
}

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
              <span className="client-dashboard-activity-icon-wrap" aria-hidden>
                <AppIcon
                  icon={activityIcon(item)}
                  className="client-dashboard-activity-icon"
                />
              </span>
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
