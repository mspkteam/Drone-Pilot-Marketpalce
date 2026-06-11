import Link from "next/link";
import {
  badgeToneForStatus,
  CLIENT_MY_PROJECTS_ROUTES,
  type ClientMyProject,
} from "@/lib/client/my-projects-mock";
import { CalendarIcon, PinIcon } from "./ClientMyProjectsIcons";

type ClientProjectCardProps = {
  project: ClientMyProject;
};

export function ClientProjectCard({ project }: ClientProjectCardProps) {
  const badgeTone = badgeToneForStatus(project.status);
  const bidsLabel =
    project.bidsCount === 1
      ? "1 received"
      : `${project.bidsCount} received`;

  return (
    <article className="client-my-projects-card">
      <div className="client-my-projects-card-top">
        <h2 className="client-my-projects-card-title">{project.title}</h2>
        <span
          className={`client-my-projects-badge client-my-projects-badge--${badgeTone}`}
        >
          {project.status}
        </span>
      </div>

      <div className="client-my-projects-card-meta">
        <span className="client-my-projects-meta-item">
          <PinIcon />
          {project.location}
        </span>
        <span className="client-my-projects-meta-item">
          <CalendarIcon />
          {project.postedLabel}
        </span>
      </div>

      <div className="client-my-projects-stats">
        <div className="client-my-projects-stat">
          <span className="client-my-projects-stat-label">Bids</span>
          <span className="client-my-projects-stat-value">{bidsLabel}</span>
        </div>
        <div className="client-my-projects-stat">
          <span className="client-my-projects-stat-label">Budget</span>
          <span className="client-my-projects-stat-value">{project.budget}</span>
        </div>
      </div>

      <div className="client-my-projects-card-actions">
        <Link
          href={CLIENT_MY_PROJECTS_ROUTES.projectBids(project.slug)}
          className="client-my-projects-btn-outline"
        >
          View Bids
        </Link>
        <Link
          href={CLIENT_MY_PROJECTS_ROUTES.projectDetail(project.slug)}
          className="client-my-projects-btn-gold"
        >
          View Details
        </Link>
      </div>
    </article>
  );
}
