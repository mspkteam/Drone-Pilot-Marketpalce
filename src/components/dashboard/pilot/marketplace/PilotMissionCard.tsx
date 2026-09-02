import Link from "next/link";
import { UserAvatar } from "@/components/ui/UserAvatar";
import type { PilotMissionCard as MissionCard } from "@/lib/pilot/marketplace-map";

type PilotMissionCardProps = {
  mission: MissionCard;
};

export function PilotMissionCardView({ mission }: PilotMissionCardProps) {
  const ctaLabel = mission.hasApplied
    ? "View Proposal"
    : mission.canApply
      ? "View & Submit Proposal"
      : "View Mission";

  return (
    <article className="pilot-marketplace-card">
      <div className="pilot-marketplace-card-body">
        <div className="pilot-marketplace-card-row">
          <UserAvatar
            className="pilot-marketplace-avatar"
            src={mission.avatarUrl}
            initials={mission.initials}
          />

          <div className="pilot-marketplace-card-main">
            <span className="pilot-marketplace-category">{mission.category}</span>
            <h3 className="pilot-marketplace-card-title">{mission.title}</h3>

            <div className="pilot-marketplace-client-row">
              <span className="pilot-marketplace-client-name">{mission.clientName}</span>
              {mission.rating ? (
                <span
                  className="pilot-marketplace-rating"
                  aria-label={`Rating ${mission.rating}`}
                >
                  <img
                    src="/icons/pilot-dashboard/marketplace-star.svg"
                    alt=""
                    width={14}
                    height={14}
                    className="pilot-marketplace-star-icon"
                  />
                  {mission.rating}
                </span>
              ) : null}
            </div>

            <p className="pilot-marketplace-location">
              <img
                src="/icons/pilot-dashboard/location.svg"
                alt=""
                width={12}
                height={12}
                className="pilot-marketplace-pin-icon"
              />
              {mission.location}
            </p>
          </div>
        </div>

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

        {!mission.canApply && !mission.hasApplied && mission.eligibilityNote ? (
          <p className="pilot-marketplace-eligibility" role="status">
            {mission.eligibilityNote}
          </p>
        ) : null}
      </div>

      <Link href={mission.href} className="pilot-marketplace-cta">
        {ctaLabel}
      </Link>
    </article>
  );
}
