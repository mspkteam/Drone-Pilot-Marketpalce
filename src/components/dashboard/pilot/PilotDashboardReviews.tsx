import Link from "next/link";
import { PILOT_DASHBOARD_ROUTES } from "@/lib/pilot/dashboard-overview-mock";
import type { PilotDashboardReviewCard } from "@/lib/pilot/dashboard-page-data";

type PilotDashboardReviewsProps = {
  averageRating: number | null;
  count: number;
  items: PilotDashboardReviewCard[];
  usingMock: boolean;
};

function Stars({ value }: { value: number }) {
  return (
    <span className="pilot-dashboard-stars" aria-label={`${value} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className={i < value ? "pilot-dashboard-star pilot-dashboard-star--on" : "pilot-dashboard-star"}
          aria-hidden
        >
          ★
        </span>
      ))}
    </span>
  );
}

export function PilotDashboardReviews({
  averageRating,
  count,
  items,
  usingMock,
}: PilotDashboardReviewsProps) {
  const rating = averageRating ?? 4.9;
  const reviewCount = count > 0 ? count : 47;
  const fillPct = Math.min(100, Math.round((rating / 5) * 100));

  return (
    <section className="pilot-dashboard-panel pilot-dashboard-panel--warm pilot-dashboard-bracket-card">
      <div className="pilot-dashboard-panel-head">
        <h2 className="pilot-dashboard-panel-title pilot-dashboard-panel-title--reviews">Reviews</h2>
        <Link href={PILOT_DASHBOARD_ROUTES.reviews} className="pilot-dashboard-panel-link">
          VIEW ALL →
        </Link>
      </div>

      {usingMock ? (
        <p className="pilot-dashboard-panel-note" role="status">
          Sample reviews shown until published client ratings are available.
        </p>
      ) : null}

      <div className="pilot-dashboard-rating-summary">
        <p className="pilot-dashboard-rating-value">{rating}/5</p>
        <Stars value={Math.round(rating)} />
        <div className="pilot-dashboard-rating-bar" aria-hidden>
          <div className="pilot-dashboard-rating-bar-fill" style={{ width: `${fillPct}%` }} />
        </div>
        <p className="pilot-dashboard-rating-meta">BASED ON {reviewCount} REVIEWS</p>
      </div>

      <div className="pilot-dashboard-review-list">
        {items.map((review) => (
          <article key={review.id} className="pilot-dashboard-review-card">
            <div className="pilot-dashboard-review-head">
              <h3 className="pilot-dashboard-review-title">{review.title}</h3>
              <span className="pilot-dashboard-review-date">{review.date}</span>
            </div>
            <Stars value={review.rating} />
            <p className="pilot-dashboard-review-text">{review.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
