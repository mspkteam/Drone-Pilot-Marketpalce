import Link from "next/link";
import { PILOT_DASHBOARD_ROUTES } from "@/lib/pilot/dashboard-overview-mock";
import type { PilotRecommendedJobCard } from "@/lib/pilot/dashboard-page-data";

type PilotDashboardRecommendedJobsProps = {
  jobs: PilotRecommendedJobCard[];
  usingMock: boolean;
};

function categoryTone(category: string): "gold" | "green" | "neutral" {
  const value = category.toUpperCase();
  if (value.includes("AGRICULTURE") || value.includes("AGRI")) return "green";
  if (
    value.includes("ENERGY") ||
    value.includes("OTHER") ||
    value.includes("EVENTS") ||
    value.includes("REAL ESTATE")
  ) {
    return "neutral";
  }
  return "gold";
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
          {jobs.map((job) => {
            const tone = categoryTone(job.category);
            const categoryClass =
              tone === "green"
                ? "pilot-dashboard-job-category pilot-dashboard-job-category--green"
                : tone === "neutral"
                  ? "pilot-dashboard-job-category pilot-dashboard-job-category--neutral"
                  : "pilot-dashboard-job-category";

            return (
              <article key={job.id} className="pilot-dashboard-job-card">
                <div className="pilot-dashboard-job-top">
                  <span className={categoryClass}>{job.category}</span>
                  <span className="pilot-dashboard-job-price">{job.price}</span>
                </div>
                <h3 className="pilot-dashboard-job-title">{job.title}</h3>
                <p className="pilot-dashboard-job-location">
                  <img
                    src="/icons/pilot-dashboard/location.svg"
                    alt=""
                    className="pilot-dashboard-job-meta-icon"
                    width={12}
                    height={12}
                  />
                  {job.location}
                </p>
                <div className="pilot-dashboard-job-footer">
                  <span className="pilot-dashboard-job-time">
                    <img
                      src="/icons/pilot-dashboard/clock.svg"
                      alt=""
                      className="pilot-dashboard-job-meta-icon"
                      width={12}
                      height={12}
                    />
                    {job.time}
                  </span>
                  <Link href={job.href} className="pilot-dashboard-job-action">
                    {job.hasApplied ? "View Proposal →" : "Submit Proposal →"}
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
