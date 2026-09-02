import Link from "next/link";
import { PILOT_DASHBOARD_ROUTES } from "@/lib/pilot/dashboard-routes";
import type {
  PilotProfileStrengthItem,
  PilotProfileStrengthStatus,
} from "@/lib/pilot/dashboard-page-data";

type PilotDashboardProfileStrengthProps = {
  pct: number;
  items: PilotProfileStrengthItem[];
};

const STATUS_LABEL: Record<PilotProfileStrengthStatus, string> = {
  done: "DONE",
  partial: "PARTIAL",
  missing: "MISSING",
};

export function PilotDashboardProfileStrength({
  pct,
  items,
}: PilotDashboardProfileStrengthProps) {
  const ringStyle = {
    background: `conic-gradient(var(--color-gold) ${pct}%, rgba(244,241,234,0.08) 0)`,
  };

  return (
    <section className="pilot-dashboard-panel pilot-dashboard-bracket-card">
      <div className="pilot-dashboard-panel-head">
        <h2 className="pilot-dashboard-panel-title">PROFILE STRENGTH</h2>
        <Link href={PILOT_DASHBOARD_ROUTES.profile} className="pilot-dashboard-panel-link">
          COMPLETE →
        </Link>
      </div>

      <div className="pilot-dashboard-strength-body">
        <div className="pilot-dashboard-strength-ring-wrap">
          <div className="pilot-dashboard-strength-ring" style={ringStyle}>
            <div className="pilot-dashboard-strength-ring-inner">
              <span className="pilot-dashboard-strength-pct">{pct}%</span>
            </div>
          </div>
        </div>

        <ul className="pilot-dashboard-strength-list">
          {items.map((item) => (
            <li key={item.label} className="pilot-dashboard-strength-row">
              <span className="pilot-dashboard-strength-label">{item.label}</span>
              <span
                className={`pilot-dashboard-strength-pill pilot-dashboard-strength-pill--${item.status}`}
              >
                {STATUS_LABEL[item.status]}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
