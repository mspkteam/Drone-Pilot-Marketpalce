import Link from "next/link";
import { PilotCountdownTimer } from "@/components/dashboard/pilot/PilotCountdownTimer";
import { PILOT_DASHBOARD_ROUTES } from "@/lib/pilot/dashboard-overview-mock";
import type { PilotLockedJobCard } from "@/lib/pilot/locked-jobs-map";

type PilotLockedJobCardProps = {
  job: PilotLockedJobCard;
};

function LockIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
      <rect x="2" y="4.5" width="6" height="4.5" rx="0.5" stroke="currentColor" strokeWidth="1" />
      <path
        d="M3.25 4.5V3.25a1.75 1.75 0 013.5 0V4.5"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function PilotLockedJobCardView({ job }: PilotLockedJobCardProps) {
  return (
    <article className="pilot-locked-jobs-card">
      <div>
        <div className="pilot-locked-jobs-card-top">
          <span className="pilot-locked-jobs-pill">
            <LockIcon />
            LOCKED
          </span>
          <span className="pilot-locked-jobs-budget">{job.budget}</span>
        </div>

        <h3 className="pilot-locked-jobs-card-title">{job.title}</h3>
        <p className="pilot-locked-jobs-reason">Reason: {job.reason}</p>

        <div className="pilot-locked-jobs-countdown-box">
          <p className="pilot-locked-jobs-countdown-label">UNLOCKS IN</p>
          <PilotCountdownTimer
            unlockAt={job.unlockAt}
            className="pilot-locked-jobs-countdown-value"
          />
        </div>

        <p className="pilot-locked-jobs-requirement">
          REQUIRES: {job.requirement}
        </p>
      </div>

      <Link
        href={PILOT_DASHBOARD_ROUTES.subscription}
        className="pilot-locked-jobs-cta"
      >
        Upgrade Plan to Unlock
      </Link>
    </article>
  );
}
