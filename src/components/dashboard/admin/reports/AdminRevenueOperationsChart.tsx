import type { AdminRevenueMonthPoint } from "@/types/admin-reports";

type AdminRevenueOperationsChartProps = {
  months: AdminRevenueMonthPoint[];
  showFinancial: boolean;
};

export function AdminRevenueOperationsChart({
  months,
  showFinancial,
}: AdminRevenueOperationsChartProps) {
  const width = 720;
  const height = 360;
  const padX = 24;
  const padY = 20;
  const chartW = width - padX * 2;
  const chartH = height - padY * 2;

  const maxProfit = Math.max(1, ...months.map((m) => m.operatingProfit));
  const maxMargin = Math.max(1, ...months.map((m) => m.grossMarginPct));

  const colW = chartW / months.length;

  return (
    <div className="admin-reports-chart-wrap">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="admin-reports-chart-svg"
        role="img"
        aria-label={
          showFinancial
            ? "Revenue operations chart for the last twelve months"
            : "Mission operations chart for the last twelve months"
        }
      >
        {months.map((month, index) => {
          const x = padX + index * colW + colW / 2;
          return (
            <line
              key={`grid-${month.monthLabel}`}
              x1={x}
              y1={padY}
              x2={x}
              y2={padY + chartH}
              stroke="rgba(244,241,234,0.06)"
              strokeWidth="1"
            />
          );
        })}

        {months.map((month, index) => {
          const x = padX + index * colW + colW / 2;
          const profitLen = (month.operatingProfit / maxProfit) * (chartW * 0.22);
          const marginLen = showFinancial
            ? (month.grossMarginPct / maxMargin) * (chartW * 0.14)
            : 0;
          const yProfit = padY + chartH * 0.35;
          const yMargin = padY + chartH * 0.62;

          return (
            <g key={month.monthLabel}>
              <line
                x1={x - profitLen / 2}
                y1={yProfit}
                x2={x + profitLen / 2}
                y2={yProfit}
                stroke="var(--color-gold)"
                strokeWidth="3"
                strokeLinecap="round"
              />
              {showFinancial ? (
                <line
                  x1={x - marginLen / 2}
                  y1={yMargin}
                  x2={x + marginLen / 2}
                  y2={yMargin}
                  stroke="rgba(168,162,154,0.55)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              ) : null}
            </g>
          );
        })}
      </svg>

      <div className="admin-reports-chart-months" aria-hidden>
        {months.map((month) => (
          <span key={month.monthLabel} className="admin-reports-chart-month">
            {month.monthShort}
          </span>
        ))}
      </div>
    </div>
  );
}
