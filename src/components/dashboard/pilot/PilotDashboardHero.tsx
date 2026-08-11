import Link from "next/link";
import { PILOT_DASHBOARD_ROUTES } from "@/lib/pilot/dashboard-overview-mock";
import type { PilotDashboardPageData } from "@/lib/pilot/dashboard-page-data";

type PilotDashboardHeroProps = {
  data: PilotDashboardPageData;
};

export function PilotDashboardHero({ data }: PilotDashboardHeroProps) {
  const jobCount = data.hero.newRecommendedJobs;
  const proposalCount = data.hero.proposalsAwaitingResponse;
  const jobLabel = jobCount === 1 ? "job" : "jobs";
  const proposalLabel = proposalCount === 1 ? "proposal" : "proposals";

  return (
    <section className="pilot-dashboard-hero pilot-dashboard-bracket-card" aria-label="Pilot status">
      <div className="pilot-dashboard-hero-glow" aria-hidden />

      <div className="pilot-dashboard-hero-inner">
        <div className="pilot-dashboard-hero-copy">
          <p className="pilot-dashboard-eyebrow">PILOT STATUS · ACTIVE</p>
          <h1 className="pilot-dashboard-hero-title">
            Welcome back, {data.displayName}
          </h1>
          <p className="pilot-dashboard-hero-desc">
            You have{" "}
            <span className="pilot-dashboard-gold">
              {jobCount} new recommended {jobLabel}
            </span>{" "}
            and {proposalCount} {proposalLabel} awaiting client response. Airspace
            clear for operations.
          </p>

          <div className="pilot-dashboard-badges">
            <span className="pilot-dashboard-badge pilot-dashboard-badge--gold">
              {data.rankBadge}
            </span>
            {data.isVerified ? (
              <span className="pilot-dashboard-badge pilot-dashboard-badge--verified">
                <img
                  src="/icons/pilot-dashboard/verified-check.svg"
                  alt=""
                  className="pilot-dashboard-badge-icon"
                  width={12}
                  height={12}
                />
                Verified
              </span>
            ) : null}
            {data.membershipDaysLeft != null ? (
              <span className="pilot-dashboard-badge pilot-dashboard-badge--gold">
                Membership · {data.membershipDaysLeft}d left
              </span>
            ) : null}
          </div>
        </div>

        <div className="pilot-dashboard-hero-actions">
          <Link href={PILOT_DASHBOARD_ROUTES.browseJobs} className="pilot-dashboard-btn-primary">
            Browse Jobs
            <img
              src="/icons/pilot-dashboard/arrow-primary.svg"
              alt=""
              className="pilot-dashboard-btn-icon"
              width={16}
              height={16}
            />
          </Link>
          <Link href={PILOT_DASHBOARD_ROUTES.profile} className="pilot-dashboard-btn-outline">
            Complete Profile
            <img
              src="/icons/pilot-dashboard/arrow-outline.svg"
              alt=""
              className="pilot-dashboard-btn-icon"
              width={16}
              height={16}
            />
          </Link>
          <Link href={PILOT_DASHBOARD_ROUTES.verifications} className="pilot-dashboard-btn-outline">
            Upload Documents
            <img
              src="/icons/pilot-dashboard/arrow-outline.svg"
              alt=""
              className="pilot-dashboard-btn-icon"
              width={16}
              height={16}
            />
          </Link>
          <Link href={PILOT_DASHBOARD_ROUTES.earnings} className="pilot-dashboard-btn-outline">
            View Earnings
            <img
              src="/icons/pilot-dashboard/arrow-outline.svg"
              alt=""
              className="pilot-dashboard-btn-icon"
              width={16}
              height={16}
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
