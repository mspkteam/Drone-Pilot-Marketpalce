import type { CaptainClubStats } from "@/types/captains-club";

type CaptainsClubStatsBarProps = {
  stats: CaptainClubStats;
};

function StatIcon({ children }: { children: React.ReactNode }) {
  return (
    <span className="captains-club-stat-icon" aria-hidden>
      {children}
    </span>
  );
}

export function CaptainsClubStatsBar({ stats }: CaptainsClubStatsBarProps) {
  return (
    <section className="captains-club-stats" aria-label="Captain's Club metrics">
      <div className="public-container">
        <div className="captains-club-stats-grid">
          <article className="captains-club-stat-card">
            <StatIcon>✈</StatIcon>
            <p className="captains-club-stat-label">Active Captains</p>
            <p className="captains-club-stat-value">{stats.activeCaptains}</p>
          </article>
          <article className="captains-club-stat-card">
            <StatIcon>✓</StatIcon>
            <p className="captains-club-stat-label">Verified Profiles</p>
            <p className="captains-club-stat-value">{stats.verifiedProfilesLabel}</p>
          </article>
          <article className="captains-club-stat-card">
            <StatIcon>◎</StatIcon>
            <p className="captains-club-stat-label">Regions Covered</p>
            <p className="captains-club-stat-value">{stats.regionsCovered}</p>
          </article>
          <article className="captains-club-stat-card">
            <StatIcon>★</StatIcon>
            <p className="captains-club-stat-label">Avg. Rating</p>
            <p className="captains-club-stat-value">{stats.averageRatingLabel}</p>
          </article>
        </div>
      </div>
    </section>
  );
}
