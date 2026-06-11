import { PilotCountdownTimer } from "@/components/dashboard/pilot/PilotCountdownTimer";
import type { PilotLockedJobRow } from "@/lib/pilot/dashboard-page-data";

type PilotDashboardLockedJobsProps = {
  jobs: PilotLockedJobRow[];
  usingMock: boolean;
};

export function PilotDashboardLockedJobs({
  jobs,
  usingMock,
}: PilotDashboardLockedJobsProps) {
  if (jobs.length === 0) return null;

  return (
    <section className="pilot-dashboard-panel pilot-dashboard-bracket-card">
      <h2 className="pilot-dashboard-panel-title pilot-dashboard-panel-title--solo">
        VISIBILITY COUNTDOWN · LOCKED JOBS
      </h2>

      {usingMock ? (
        <p className="pilot-dashboard-panel-note" role="status">
          Sample rank-locked missions — live timers use membership visibility rules (M27).
        </p>
      ) : null}

      <ul className="pilot-dashboard-locked-list">
        {jobs.map((job) => (
          <li key={job.id} className="pilot-dashboard-locked-row">
            <div className="pilot-dashboard-locked-copy">
              <p className="pilot-dashboard-locked-title">{job.title}</p>
              <p className="pilot-dashboard-locked-req">{job.requirement}</p>
            </div>
            <div className="pilot-dashboard-locked-timer">
              <PilotCountdownTimer unlockAt={job.unlockAt} />
              <span className="pilot-dashboard-locked-label">UNLOCKS IN</span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
