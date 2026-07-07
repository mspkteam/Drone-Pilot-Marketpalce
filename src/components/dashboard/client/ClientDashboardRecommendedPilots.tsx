import Link from "next/link";
import {
  AppIcon,
  ArrowUpRight,
  BadgeCheck,
  Clock,
  Star,
} from "@/components/icons";
import {
  CLIENT_DASHBOARD_ROUTES,
  type ClientRecommendedPilot,
} from "@/lib/client/dashboard-overview";

type ClientDashboardRecommendedPilotsProps = {
  pilots: ClientRecommendedPilot[];
};

export function ClientDashboardRecommendedPilots({
  pilots,
}: ClientDashboardRecommendedPilotsProps) {
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

      {pilots.length === 0 ? (
        <p className="client-dashboard-empty-copy" role="status">
          No public pilot profiles are available yet.{" "}
          <Link href={CLIENT_DASHBOARD_ROUTES.browsePilots} className="underline">
            Browse the directory
          </Link>
          .
        </p>
      ) : (
        <div className="client-dashboard-pilots-grid">
          {pilots.map((pilot) => (
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
                    <AppIcon icon={BadgeCheck} className="client-dashboard-pilot-verified-icon" />
                  </span>
                ) : null}
              </div>

              <div className="client-dashboard-pilot-stats">
                <span className="client-dashboard-pilot-stat client-dashboard-pilot-stat--rating">
                  <AppIcon
                    icon={Star}
                    className="client-dashboard-pilot-stat-icon client-dashboard-pilot-stat-icon--gold"
                    fill="currentColor"
                  />
                  <span>{pilot.rating}</span>
                </span>
                <span className="client-dashboard-pilot-stat">{pilot.projects}</span>
                <span className="client-dashboard-pilot-stat">
                  <AppIcon icon={Clock} className="client-dashboard-pilot-stat-icon" />
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
                  <AppIcon icon={ArrowUpRight} className="client-dashboard-pilot-link-icon" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
