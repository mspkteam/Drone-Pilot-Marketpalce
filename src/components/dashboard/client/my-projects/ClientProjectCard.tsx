import Link from "next/link";
import {
  CLIENT_MY_PROJECTS_ROUTES,
  type ClientMyProject,
} from "@/lib/client/my-projects";
import { CalendarIcon, PinIcon } from "./ClientMyProjectsIcons";

type ClientProjectCardProps = {
  project: ClientMyProject;
};

export function ClientProjectCard({ project }: ClientProjectCardProps) {
  const bidsLabel =
    project.bidsCount === 1
      ? "1 received"
      : `${project.bidsCount} received`;

  const showBidsLink =
    project.jobStatus === "open" ||
    project.jobStatus === "in_bidding" ||
    project.jobStatus === "assigned" ||
    project.jobStatus === "approved" ||
    project.bidsCount > 0;

  return (
    <article className="client-my-projects-card">
      <div className="client-my-projects-card-top">
        <h2 className="client-my-projects-card-title">{project.title}</h2>
        <span
          className={`client-my-projects-badge client-my-projects-badge--${project.badgeTone}`}
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
        {showBidsLink ? (
          <Link
            href={CLIENT_MY_PROJECTS_ROUTES.projectBids(project.id)}
            className="client-my-projects-btn-outline"
          >
            View Quotes
          </Link>
        ) : (
          <span className="client-my-projects-btn-outline client-my-projects-btn-outline--disabled">
            View Quotes
          </span>
        )}
        <Link
          href={CLIENT_MY_PROJECTS_ROUTES.projectDetail(project.id)}
          className="client-my-projects-btn-gold"
        >
          View Details
        </Link>
      </div>
    </article>
  );
}
