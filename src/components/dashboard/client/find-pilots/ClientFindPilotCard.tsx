import Link from "next/link";
import type { ClientFindPilot } from "@/lib/client/find-pilots";
import {
  ClockIcon,
  PinIcon,
  StarIcon,
  VerifiedIcon,
} from "./ClientFindPilotsIcons";

type ClientFindPilotCardProps = {
  pilot: ClientFindPilot;
};

export function ClientFindPilotCard({ pilot }: ClientFindPilotCardProps) {
  return (
    <article className="client-find-pilots-card">
      <div className="client-find-pilots-card-top">
        <div className="client-find-pilots-identity">
          <span className="client-find-pilots-avatar" aria-hidden>
            {pilot.initials}
          </span>

          <div className="client-find-pilots-nameblock">
            <p className="client-find-pilots-name">{pilot.name}</p>
            <p className="client-find-pilots-location">
              <PinIcon />
              {pilot.location}
            </p>
          </div>
        </div>

        {pilot.verified ? (
          <span className="client-find-pilots-verified-wrap" aria-label="Verified">
            <VerifiedIcon />
          </span>
        ) : null}
      </div>

      <div className="client-find-pilots-stats">
        <span className="client-find-pilots-stat client-find-pilots-stat--rating">
          <StarIcon />
          {pilot.rating}
        </span>
        <span className="client-find-pilots-stat">{pilot.projects}</span>
        <span className="client-find-pilots-stat">
          <ClockIcon />
          {pilot.hours}
        </span>
      </div>

      <div className="client-find-pilots-tags">
        {pilot.tags.map((tag) => (
          <span key={tag} className="client-find-pilots-tag">
            {tag}
          </span>
        ))}
      </div>

      <div className="client-find-pilots-divider" aria-hidden />

      <div className="client-find-pilots-footer">
        <p className="client-find-pilots-price">{pilot.priceLabel}</p>
        <Link href={pilot.profileHref} className="client-find-pilots-profile-btn">
          View profile
        </Link>
      </div>
    </article>
  );
}
