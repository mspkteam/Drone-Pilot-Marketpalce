import type { DashboardRankCardData } from "@/types/dashboard-nav";

type DashboardRankCardProps = {
  data: DashboardRankCardData;
};

export function DashboardRankCard({ data }: DashboardRankCardProps) {
  return (
    <div className="dashboard-rank-card" aria-label="Pilot rank status">
      <span className="dashboard-rank-card-corner dashboard-rank-card-corner--tl" aria-hidden />
      <span className="dashboard-rank-card-corner dashboard-rank-card-corner--br" aria-hidden />
      <p className="dashboard-rank-card-callsign">{data.callSign}</p>
      <p className="dashboard-rank-card-rank">{data.rankLabel}</p>
      <div className="dashboard-rank-card-track" aria-hidden>
        <div
          className="dashboard-rank-card-fill"
          style={{ width: `${Math.min(100, Math.max(0, data.progressPct))}%` }}
        />
      </div>
      <p className="dashboard-rank-card-progress">
        Rank progress · {data.progressPct}%
      </p>
    </div>
  );
}
