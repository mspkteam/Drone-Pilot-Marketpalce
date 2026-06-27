import Link from "next/link";
import { getCaptainBadgeLabel } from "@/lib/pilot/captains-club";
import type { CaptainClubPilot } from "@/types/captains-club";

type CaptainClubCardProps = {
  captain: CaptainClubPilot;
};

export function CaptainClubCard({ captain }: CaptainClubCardProps) {
  return (
    <article className="captains-club-card">
      <div className="captains-club-card-head">
        <span className="captains-club-card-avatar" aria-hidden>
          {captain.initials}
        </span>
        <div className="captains-club-card-meta">
          <h3 className="captains-club-card-name">{captain.name}</h3>
          <p className="captains-club-card-location">
            <span className="captains-club-card-pin" aria-hidden />
            {captain.location}
          </p>
          <p className="captains-club-card-rating">
            <span className="captains-club-card-star" aria-hidden>
              ★
            </span>
            {captain.ratingLabel}
            {captain.reviewCount > 0 ? (
              <span className="captains-club-card-review-count">
                ({captain.reviewCount})
              </span>
            ) : null}
          </p>
        </div>
      </div>

      <div className="captains-club-card-badges">
        {captain.badges.map((badge) => (
          <span key={badge} className="captains-club-badge">
            {getCaptainBadgeLabel(badge)}
          </span>
        ))}
      </div>

      {captain.bio ? (
        <p className="captains-club-card-bio">{captain.bio}</p>
      ) : (
        <p className="captains-club-card-bio captains-club-card-bio--empty">
          Professional drone captain available for enterprise missions.
        </p>
      )}

      <Link href={captain.profileHref} className="captains-club-card-link">
        View Profile →
      </Link>
    </article>
  );
}
