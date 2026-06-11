import Link from "next/link";
import type { PilotMissionCard as MissionCard } from "@/lib/pilot/marketplace-map";

type PilotMissionCardProps = {
  mission: MissionCard;
};

function PinIcon() {
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

export function PilotMissionCardView({ mission }: PilotMissionCardProps) {
  const ctaLabel = mission.hasApplied
    ? "View Proposal"
    : "View & Submit Proposal";

  return (
    <article className="pilot-marketplace-card">
      <div className="pilot-marketplace-card-top">
        <span className="pilot-marketplace-avatar" aria-hidden>
          {mission.initials}
        </span>
        <span className="pilot-marketplace-category">{mission.category}</span>
      </div>

      <h3 className="pilot-marketplace-card-title">{mission.title}</h3>

      <p className="pilot-marketplace-client">
        <span>{mission.clientName}</span>
        <span className="pilot-marketplace-rating" aria-label={`Rating ${mission.rating}`}>
          <span className="pilot-marketplace-star" aria-hidden>
            ★
          </span>{" "}
          {mission.rating}
        </span>
      </p>

      <p className="pilot-marketplace-location">
        <PinIcon />
        {mission.location}
      </p>

      <div className="pilot-marketplace-meta">
        <div>
          <p className="pilot-marketplace-meta-label">DEADLINE</p>
          <p className="pilot-marketplace-meta-value">{mission.deadline}</p>
        </div>
        <div className="pilot-marketplace-meta-budget">
          <p className="pilot-marketplace-meta-label pilot-marketplace-meta-label--budget">
            BUDGET
          </p>
          <p className="pilot-marketplace-budget">{mission.budget}</p>
        </div>
      </div>

      <p className="pilot-marketplace-license">LICENSE: {mission.license}</p>

      <Link href={mission.href} className="pilot-marketplace-cta">
        {ctaLabel}
      </Link>
    </article>
  );
}
