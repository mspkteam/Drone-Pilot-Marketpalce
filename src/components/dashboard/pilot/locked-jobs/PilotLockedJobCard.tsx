import Link from "next/link";
import { PilotCountdownTimer } from "@/components/dashboard/pilot/PilotCountdownTimer";
import { PILOT_DASHBOARD_ROUTES } from "@/lib/pilot/dashboard-routes";
import type { PilotLockedJobCard } from "@/lib/pilot/locked-jobs-map";

type PilotLockedJobCardProps = {
  job: PilotLockedJobCard;
};

export function PilotLockedJobCardView({ job }: PilotLockedJobCardProps) {
  return (
    <article className="pilot-locked-jobs-card">
      <div className="pilot-locked-jobs-card-body">
        <div className="pilot-locked-jobs-card-top">
          <span className="pilot-locked-jobs-pill">
            <img
              src="/icons/pilot-dashboard/locked-lock.svg"
              alt=""
              width={13}
              height={16}
              className="pilot-locked-jobs-pill-icon"
            />
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
