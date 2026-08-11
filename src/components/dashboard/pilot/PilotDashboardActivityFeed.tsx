import type { PilotDashboardActivityItem } from "@/lib/pilot/dashboard-page-data";

type PilotDashboardActivityFeedProps = {
  items: PilotDashboardActivityItem[];
  usingMock: boolean;
};

function activityIconSrc(item: PilotDashboardActivityItem): string {
  if (item.tone === "success") return "/icons/pilot-dashboard/activity-check.svg";
  if (item.tone === "warning") return "/icons/pilot-dashboard/activity-alert.svg";
  if (item.tone === "muted") return "/icons/pilot-dashboard/activity-signal.svg";
  if (/payout|cleared|\$/i.test(item.text)) {
    return "/icons/pilot-dashboard/activity-wallet.svg";
  }
  return "/icons/pilot-dashboard/activity-pulse.svg";
}

function ActivityIcon({ item }: { item: PilotDashboardActivityItem }) {
  return (
    <span className="pilot-dashboard-activity-icon" aria-hidden>
      <img src={activityIconSrc(item)} alt="" width={16} height={16} />
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
            <ActivityIcon item={item} />
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
