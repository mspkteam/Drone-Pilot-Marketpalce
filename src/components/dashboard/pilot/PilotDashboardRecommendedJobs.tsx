import Link from "next/link";
import { PILOT_DASHBOARD_ROUTES } from "@/lib/pilot/dashboard-overview-mock";
import type { PilotRecommendedJobCard } from "@/lib/pilot/dashboard-page-data";

type PilotDashboardRecommendedJobsProps = {
  jobs: PilotRecommendedJobCard[];
  usingMock: boolean;
};

function LocationIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
      <path
        d="M6 1a3 3 0 00-3 3c0 2.25 3 6 3 6s3-3.75 3-6a3 3 0 00-3-3z"
        stroke="currentColor"
        strokeWidth="1"
      />
      <circle cx="6" cy="4" r="1" fill="currentColor" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
      <circle cx="6" cy="6" r="4.25" stroke="currentColor" strokeWidth="1" />
      <path d="M6 3.5V6l1.75 1.25" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

export function PilotDashboardRecommendedJobs({
  jobs,
  usingMock,
}: PilotDashboardRecommendedJobsProps) {
  return (
    <section className="pilot-dashboard-panel pilot-dashboard-bracket-card">
      <div className="pilot-dashboard-panel-head">
        <h2 className="pilot-dashboard-panel-title">RECOMMENDED JOBS</h2>
        <Link href={PILOT_DASHBOARD_ROUTES.browseJobs} className="pilot-dashboard-panel-link">
          VIEW ALL →
        </Link>
      </div>

      {usingMock ? (
        <p className="pilot-dashboard-panel-note" role="status">
          Showing sample missions until marketplace jobs are available.
        </p>
      ) : null}

      {jobs.length === 0 ? (
        <p className="pilot-dashboard-muted">
          No open jobs right now. Check back after admins approve client postings.
        </p>
      ) : (
        <div className="pilot-dashboard-jobs-grid">
          {jobs.map((job) => (
            <article key={job.id} className="pilot-dashboard-job-card">
              <div className="pilot-dashboard-job-top">
                <span className="pilot-dashboard-job-category">{job.category}</span>
                <span className="pilot-dashboard-job-price">{job.price}</span>
              </div>
              <h3 className="pilot-dashboard-job-title">{job.title}</h3>
              <p className="pilot-dashboard-job-location">
                <LocationIcon />
                {job.location}
              </p>
              <div className="pilot-dashboard-job-footer">
                <span className="pilot-dashboard-job-time">
                  <ClockIcon />
                  {job.time}
                </span>
                <Link href={job.href} className="pilot-dashboard-job-action">
                  {job.hasApplied ? "View Proposal →" : "Submit Proposal →"}
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
