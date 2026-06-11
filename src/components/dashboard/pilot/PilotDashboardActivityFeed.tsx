import type { PilotDashboardActivityItem } from "@/lib/pilot/dashboard-page-data";

type PilotDashboardActivityFeedProps = {
  items: PilotDashboardActivityItem[];
  usingMock: boolean;
};

function ActivityIcon({ tone }: { tone: PilotDashboardActivityItem["tone"] }) {
  return (
    <span className={`pilot-dashboard-activity-icon pilot-dashboard-activity-icon--${tone}`} aria-hidden>
      {tone === "success" ? "✓" : tone === "warning" ? "!" : tone === "gold" ? "◆" : "◎"}
    </span>
  );
}

export function PilotDashboardActivityFeed({
  items,
  usingMock,
}: PilotDashboardActivityFeedProps) {
  return (
    <section className="pilot-dashboard-panel pilot-dashboard-bracket-card">
      <h2 className="pilot-dashboard-panel-title pilot-dashboard-panel-title--solo pilot-dashboard-panel-title--gold">
        ACTIVITY FEED
      </h2>

      {usingMock ? (
        <p className="pilot-dashboard-panel-note" role="status">
          Sample activity — live feed uses in-app notifications (M16).
        </p>
      ) : null}

      <ul className="pilot-dashboard-activity-list">
        {items.map((item) => (
          <li key={item.id} className="pilot-dashboard-activity-row">
            <ActivityIcon tone={item.tone} />
            <div className="pilot-dashboard-activity-copy">
              <p className="pilot-dashboard-activity-text">{item.text}</p>
              <p className="pilot-dashboard-activity-time">{item.timeLabel}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
