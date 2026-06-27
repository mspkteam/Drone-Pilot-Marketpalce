import Link from "next/link";
import { ClientDashboardCard } from "@/components/dashboard/client/ClientDashboardCard";
import {
  CLIENT_DASHBOARD_ROUTES,
  type ClientProjectStatus,
  type ClientRecentProject,
} from "@/lib/client/dashboard-overview";
import { cn } from "@/lib/utils";

const statusToneClass: Record<ClientProjectStatus, string> = {
  quotes_received: "client-dashboard-badge-gold",
  pilot_selected: "client-dashboard-badge-success",
  awaiting_quotes: "client-dashboard-badge-neutral",
};

type ClientDashboardRecentProjectsProps = {
  projects: ClientRecentProject[];
};

export function ClientDashboardRecentProjects({
  projects,
}: ClientDashboardRecentProjectsProps) {
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
      {projects.length === 0 ? (
        <p className="client-dashboard-empty-copy" role="status">
          No projects yet.{" "}
          <Link href={CLIENT_DASHBOARD_ROUTES.postProject} className="underline">
            Post your first project
          </Link>
          .
        </p>
      ) : (
        <ul className="client-dashboard-project-list">
          {projects.map((project) => (
            <li key={project.id} className="client-dashboard-project-row">
              <Link href={project.href} className="client-dashboard-project-link">
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
              </Link>
            </li>
          ))}
        </ul>
      )}
    </ClientDashboardCard>
  );
}
