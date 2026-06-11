import Link from "next/link";
import {
  CLIENT_DASHBOARD_ROUTES,
  CLIENT_RECOMMENDED_PILOTS,
} from "@/lib/client/dashboard-overview-mock";

function StarIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="currentColor"
      aria-hidden
      className="client-dashboard-pilot-stat-icon client-dashboard-pilot-stat-icon--gold"
    >
      <path d="M6 0.5l1.45 4.45h4.7L8.35 8.1l1.45 4.45L6 10.4 2.2 12.55 3.65 8.1.85 4.95h4.7L6 0.5z" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      aria-hidden
      className="client-dashboard-pilot-stat-icon"
    >
      <circle cx="6" cy="6" r="4.75" />
      <path d="M6 3.5V6l1.75 1.25" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function VerifiedIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.25" />
      <path
        d="M5.25 8.1l1.9 1.9 3.6-3.8"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ExternalArrowIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      aria-hidden
    >
      <path d="M3.5 8.5h5v-5M8.5 8.5L3.5 3.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ClientDashboardRecommendedPilots() {
  return (
    <section className="client-dashboard-pilots-section" aria-label="Recommended pilots">
      <header className="client-dashboard-pilots-header">
        <div className="client-dashboard-pilots-heading">
          <h2 className="client-dashboard-pilots-title">Recommended Pilots</h2>
          <p className="client-dashboard-pilots-subtitle">
            Top-rated drone pilots for your project needs
          </p>
        </div>
        <Link
          href={CLIENT_DASHBOARD_ROUTES.seeAllPilots}
          className="client-dashboard-pilots-see-all"
        >
          See all →
        </Link>
      </header>

      <div className="client-dashboard-pilots-grid">
        {CLIENT_RECOMMENDED_PILOTS.map((pilot) => (
          <article key={pilot.id} className="client-dashboard-pilot-card">
            <div className="client-dashboard-pilot-top">
              <div className="client-dashboard-pilot-identity">
                <span className="client-dashboard-pilot-avatar" aria-hidden>
                  {pilot.initials}
                </span>
                <div className="client-dashboard-pilot-nameblock">
                  <p className="client-dashboard-pilot-name">{pilot.name}</p>
                  <p className="client-dashboard-pilot-location">{pilot.location}</p>
                </div>
              </div>
              {pilot.verified ? (
                <span className="client-dashboard-pilot-verified" aria-label="Verified">
                  <VerifiedIcon />
                </span>
              ) : null}
            </div>

            <div className="client-dashboard-pilot-stats">
              <span className="client-dashboard-pilot-stat client-dashboard-pilot-stat--rating">
                <StarIcon />
                <span>{pilot.rating}</span>
              </span>
              <span className="client-dashboard-pilot-stat">{pilot.projects}</span>
              <span className="client-dashboard-pilot-stat">
                <ClockIcon />
                <span>{pilot.hours}</span>
              </span>
            </div>

            <div className="client-dashboard-pilot-tags">
              {pilot.tags.map((tag) => (
                <span key={tag} className="client-dashboard-pilot-tag">
                  {tag}
                </span>
              ))}
            </div>

            <div className="client-dashboard-pilot-footer">
              <p className="client-dashboard-pilot-price">
                <span className="client-dashboard-pilot-price-from">from </span>
                <span className="client-dashboard-pilot-price-amount">
                  {pilot.priceAmount}
                </span>
              </p>
              <Link href={pilot.profileHref} className="client-dashboard-pilot-link">
                View profile
                <ExternalArrowIcon />
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
