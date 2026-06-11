import Link from "next/link";
import { ClientDashboardCard } from "@/components/dashboard/client/ClientDashboardCard";
import {
  CLIENT_DASHBOARD_ROUTES,
  CLIENT_RECENT_PROJECTS,
  type ClientProjectStatus,
} from "@/lib/client/dashboard-overview-mock";
import { cn } from "@/lib/utils";

const statusToneClass: Record<ClientProjectStatus, string> = {
  quotes_received: "client-dashboard-badge-gold",
  pilot_selected: "client-dashboard-badge-success",
  awaiting_quotes: "client-dashboard-badge-neutral",
};

export function ClientDashboardRecentProjects() {
  return (
    <ClientDashboardCard
      title="Recent Projects"
      subtitle="Your latest postings and their status"
      className="client-dashboard-card--tall"
      action={
        <Link
          href={CLIENT_DASHBOARD_ROUTES.viewAllProjects}
          className="client-dashboard-card-link"
        >
          View all →
        </Link>
      }
    >
      <ul className="client-dashboard-project-list">
        {CLIENT_RECENT_PROJECTS.map((project) => (
          <li key={project.id} className="client-dashboard-project-row">
            <div className="client-dashboard-project-copy">
              <p className="client-dashboard-project-title">{project.title}</p>
              <p className="client-dashboard-project-meta">{project.metadata}</p>
            </div>
            <span
              className={cn(
                "client-dashboard-badge",
                statusToneClass[project.status],
              )}
            >
              {project.statusLabel}
            </span>
          </li>
        ))}
      </ul>
    </ClientDashboardCard>
  );
}
