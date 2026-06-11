import type { AdminGrowthSeriesPoint } from "@/types/admin-operations";

type AdminPlatformGrowthChartProps = {
  series: AdminGrowthSeriesPoint[];
};

export function AdminPlatformGrowthChart({
  series,
}: AdminPlatformGrowthChartProps) {
  const width = 640;
  const height = 280;
  const padX = 8;
  const padY = 16;
  const chartW = width - padX * 2;
  const chartH = height - padY * 2;

  const maxMissions = Math.max(1, ...series.map((p) => p.missionsCompleted));
  const maxPilots = Math.max(1, ...series.map((p) => p.newPilotsOnboarded));
  const maxY = Math.max(maxMissions, maxPilots, 4);

  const missionPoints = series.map((point, index) => {
    const x = padX + (index / Math.max(series.length - 1, 1)) * chartW;
    const y =
      padY + chartH - (point.missionsCompleted / maxY) * chartH;
    return { x, y, value: point.missionsCompleted };
  });

  const pilotPoints = series.map((point, index) => {
    const x = padX + (index / Math.max(series.length - 1, 1)) * chartW;
    const y =
      padY + chartH - (point.newPilotsOnboarded / maxY) * chartH;
    return { x, y, value: point.newPilotsOnboarded };
  });

  const linePath = missionPoints
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");

  const areaPath = `${linePath} L ${missionPoints[missionPoints.length - 1]!.x.toFixed(1)} ${(padY + chartH).toFixed(1)} L ${missionPoints[0]!.x.toFixed(1)} ${(padY + chartH).toFixed(1)} Z`;

  const pilotLinePath = pilotPoints
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");

  const gridLines = [0.25, 0.5, 0.75].map((ratio) => {
    const y = padY + chartH * (1 - ratio);
    return y;
  });

  return (
    <div className="admin-ops-chart-wrap">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="admin-ops-chart-svg"
        role="img"
        aria-label="Platform growth chart for missions completed and new pilots onboarded over the last 90 days"
      >
        <defs>
          <linearGradient id="admin-ops-gold-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(216,179,57,0.42)" />
            <stop offset="100%" stopColor="rgba(216,179,57,0.02)" />
          </linearGradient>
        </defs>

        {gridLines.map((y) => (
          <line
            key={y}
            x1={padX}
            y1={y}
            x2={width - padX}
            y2={y}
            stroke="rgba(244,241,234,0.06)"
            strokeWidth="1"
          />
        ))}

        <path d={areaPath} fill="url(#admin-ops-gold-fill)" />
        <path
          d={linePath}
          fill="none"
          stroke="var(--color-gold)"
          strokeWidth="2.25"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <path
          d={pilotLinePath}
          fill="none"
          stroke="var(--color-success)"
          strokeWidth="1.75"
          strokeDasharray="4 4"
          strokeLinejoin="round"
          strokeLinecap="round"
          opacity="0.85"
        />

        {missionPoints.map((p, i) => (
          <circle
            key={`m-${i}`}
            cx={p.x}
            cy={p.y}
            r="2.5"
            fill="var(--color-gold)"
          />
        ))}
      </svg>

      <div className="admin-ops-chart-labels" aria-hidden>
        {series.map((point) => (
          <span key={point.label} className="admin-ops-chart-label">
            {point.label}
          </span>
        ))}
      </div>
    </div>
  );
}
