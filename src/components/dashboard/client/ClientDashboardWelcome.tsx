import Link from "next/link";
import { AppIcon, CirclePlus, Hand, Sparkles } from "@/components/icons";
import { CLIENT_DASHBOARD_ROUTES } from "@/lib/client/dashboard-overview";

type ClientDashboardWelcomeProps = {
  clientName: string;
};

export function ClientDashboardWelcome({ clientName }: ClientDashboardWelcomeProps) {
  return (
    <section className="client-dashboard-welcome" aria-label="Welcome">
      <div className="client-dashboard-welcome-glow" aria-hidden />

      <div className="client-dashboard-welcome-inner">
        <div className="client-dashboard-welcome-copy">
          <span className="client-dashboard-pill">
            <AppIcon icon={Sparkles} className="client-dashboard-pill-icon" />
            Verified pilots nationwide
          </span>

          <h1 className="client-dashboard-welcome-title">
            <span className="client-dashboard-welcome-title-text">
              Welcome back,{" "}
              <span className="client-dashboard-welcome-name">{clientName}</span>
              <Hand className="client-dashboard-welcome-wave" strokeWidth={2} aria-hidden />
            </span>
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
            <AppIcon icon={CirclePlus} className="client-dashboard-btn-icon" />
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
