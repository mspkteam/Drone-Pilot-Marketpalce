import Link from "next/link";
import {
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
  const isAccepted = bid.status === "Accepted";
  const isDeclined = bid.status === "Declined";
  const actionsLocked =
    busy || hasAcceptedBid || isAccepted || isDeclined;
  const canShortlist = bid.applicationStatus === "submitted" && !hasAcceptedBid;
  const canManage =
    !hasAcceptedBid &&
    bid.applicationStatus === "submitted" &&
    !isAccepted &&
    !isDeclined;

  let hireLabel = "Hire Pilot";
  if (isAccepted) hireLabel = "Hired";
  else if (isDeclined) hireLabel = "Declined";
  else if (busy) hireLabel = "Hiring…";

  return (
    <article className="client-project-bids-card">
      <div className="client-project-bids-card-pilot">
        <span className="client-project-bids-avatar" aria-hidden>
          {bid.initials}
        </span>

        <div className="client-project-bids-pilot-meta">
          <div className="client-project-bids-name-row">
            <h2 className="client-project-bids-pilot-name">{bid.name}</h2>
            {bid.verified ? <VerifiedIcon /> : null}
          </div>

          <p className="client-project-bids-rating-row">
            {bid.rating ? (
              <>
                <StarIcon />
                <span className="client-project-bids-rating">{bid.rating}</span>
              </>
            ) : (
              <span className="client-project-bids-rating-pending">
                {bid.ratingLabel}
              </span>
            )}
            <span className="client-project-bids-projects">
              {bid.completedProjects}
            </span>
          </p>

          <p className="client-project-bids-note">{bid.proposalNote}</p>

          {canManage ? (
            <div className="client-project-bids-card-secondary">
              <button
                type="button"
                className={`client-project-bids-secondary-link${bid.status === "Shortlisted" ? " client-project-bids-secondary-link--active" : ""}`}
                disabled={!canShortlist || busy}
                onClick={() => onShortlist(bid.id)}
              >
                {bid.status === "Shortlisted" ? "Shortlisted" : "Shortlist"}
              </button>
              <button
                type="button"
                className="client-project-bids-secondary-link client-project-bids-secondary-link--decline"
                disabled={actionsLocked}
                onClick={() => onDecline(bid.id)}
              >
                {busy ? "Declining…" : "Decline"}
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <div className="client-project-bids-card-right">
        <div className="client-project-bids-card-metrics">
          <div className="client-project-bids-metric">
            <span className="client-project-bids-metric-label">Price</span>
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
            className="client-project-bids-btn-dark"
          >
            View Profile
          </Link>
          <button
            type="button"
            className="client-project-bids-btn-gold"
            disabled={actionsLocked || bid.applicationStatus !== "submitted"}
            onClick={() => onAccept(bid)}
          >
            {hireLabel}
          </button>
        </div>
      </div>
    </article>
  );
}
