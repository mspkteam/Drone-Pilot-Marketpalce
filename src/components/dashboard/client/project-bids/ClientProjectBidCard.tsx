import Link from "next/link";
import {
  badgeToneForBidStatus,
  CLIENT_PROJECT_BIDS_ROUTES,
  formatDeliveryDays,
  type ClientProjectBid,
} from "@/lib/client/project-bids";
import {
  ClockIcon,
  MessageIcon,
  StarIcon,
  VerifiedIcon,
} from "./ClientProjectBidsIcons";

type ClientProjectBidCardProps = {
  bid: ClientProjectBid;
  hasAcceptedBid: boolean;
  busy?: boolean;
  onShortlist: (bidId: string) => void;
  onDecline: (bidId: string) => void;
  onAccept: (bid: ClientProjectBid) => void;
};

export function ClientProjectBidCard({
  bid,
  hasAcceptedBid,
  busy = false,
  onShortlist,
  onDecline,
  onAccept,
}: ClientProjectBidCardProps) {
  const badgeTone = badgeToneForBidStatus(bid.status);
  const isAccepted = bid.status === "Accepted";
  const isDeclined = bid.status === "Declined";
  const actionsLocked =
    busy || hasAcceptedBid || isAccepted || isDeclined;
  const canShortlist = bid.applicationStatus === "submitted" && !hasAcceptedBid;

  return (
    <article className="client-project-bids-card">
      <div className="client-project-bids-card-left">
        <div className="client-project-bids-pilot-row">
          <span className="client-project-bids-avatar" aria-hidden>
            {bid.initials}
          </span>

          <div className="client-project-bids-pilot-meta">
            <div className="client-project-bids-name-row">
              <h2 className="client-project-bids-pilot-name">{bid.name}</h2>
              {bid.verified ? <VerifiedIcon /> : null}
            </div>

            <p className="client-project-bids-rating-row">
              <StarIcon />
              <span className="client-project-bids-rating">{bid.rating}</span>
              <span className="client-project-bids-projects">
                {bid.completedProjects}
              </span>
            </p>
          </div>
        </div>

        <p className="client-project-bids-note">{bid.proposalNote}</p>

        {bid.highlights.length > 0 ? (
          <ul className="client-project-bids-highlights">
            {bid.highlights.map((highlight) => (
              <li key={highlight}>{highlight}</li>
            ))}
          </ul>
        ) : null}
      </div>

      <div className="client-project-bids-card-metrics">
        <span
          className={`client-project-bids-status client-project-bids-status--${badgeTone}`}
        >
          {bid.status}
        </span>

        <div className="client-project-bids-metric">
          <span className="client-project-bids-metric-label">Bid</span>
          <span className="client-project-bids-metric-value">{bid.bidAmount}</span>
        </div>

        <div className="client-project-bids-metric">
          <span className="client-project-bids-metric-label">Delivery</span>
          <span className="client-project-bids-delivery-value">
            <ClockIcon />
            {formatDeliveryDays(bid.deliveryDays)}
          </span>
        </div>
      </div>

      <div className="client-project-bids-card-actions">
        <Link
          href={CLIENT_PROJECT_BIDS_ROUTES.messages}
          className="client-project-bids-btn-outline"
        >
          <MessageIcon />
          Message
        </Link>
        <Link
          href={CLIENT_PROJECT_BIDS_ROUTES.pilotProfile(bid.pilotProfileId)}
          className="client-project-bids-btn-outline"
        >
          View Profile
        </Link>
        <button
          type="button"
          className={`client-project-bids-btn-outline client-project-bids-btn-shortlist${bid.status === "Shortlisted" ? " client-project-bids-btn-shortlist--active" : ""}`}
          disabled={!canShortlist || busy}
          onClick={() => onShortlist(bid.id)}
        >
          Shortlist
        </button>
        <button
          type="button"
          className="client-project-bids-btn-outline client-project-bids-btn-decline"
          disabled={actionsLocked || bid.applicationStatus !== "submitted"}
          onClick={() => onDecline(bid.id)}
        >
          {busy ? "Declining…" : "Decline"}
        </button>
        <button
          type="button"
          className="client-project-bids-btn-gold"
          disabled={actionsLocked || bid.applicationStatus !== "submitted"}
          onClick={() => onAccept(bid)}
        >
          {isAccepted ? "Bid Accepted" : busy ? "Accepting…" : "Accept Bid"}
        </button>
      </div>
    </article>
  );
}
