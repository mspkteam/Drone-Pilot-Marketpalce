import Link from "next/link";
import { CLIENT_DASHBOARD_ROUTES } from "@/lib/client/dashboard-overview";

type ClientDashboardWelcomeProps = {
  clientName: string;
};

function SparkleIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" aria-hidden>
      <path d="M6 0l1.2 3.6L11 4.8 7.6 7.2 8.8 11 6 9.2 3.2 11l1.2-3.8L1 4.8l3.8-.2L6 0z" />
    </svg>
  );
}

function PlusCircleIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden
    >
      <circle cx="8" cy="8" r="6.25" />
      <path d="M8 5.25v5.5M5.25 8h5.5" strokeLinecap="round" />
    </svg>
  );
}

export function ClientDashboardWelcome({ clientName }: ClientDashboardWelcomeProps) {
  return (
    <section className="client-dashboard-welcome" aria-label="Welcome">
      <div className="client-dashboard-welcome-glow" aria-hidden />

      <div className="client-dashboard-welcome-inner">
        <div className="client-dashboard-welcome-copy">
          <span className="client-dashboard-pill">
            <SparkleIcon />
            Verified pilots nationwide
          </span>

          <h1 className="client-dashboard-welcome-title">
            Welcome back,{" "}
            <span className="client-dashboard-welcome-name">{clientName}</span>{" "}
            <span aria-hidden>👋</span>
          </h1>

          <p className="client-dashboard-welcome-subtitle">
            Need a drone pilot? Post a project and receive quotes from verified
            professionals in hours, not days.
          </p>
        </div>

        <div className="client-dashboard-welcome-actions">
          <Link
            href={CLIENT_DASHBOARD_ROUTES.postProject}
            className="client-dashboard-btn-primary"
          >
            <PlusCircleIcon />
            Post New Project
          </Link>
          <Link
            href={CLIENT_DASHBOARD_ROUTES.browsePilots}
            className="client-dashboard-btn-secondary"
          >
            Browse pilots
          </Link>
        </div>
      </div>
    </section>
  );
}
