"use client";

import { useId, useState } from "react";
import type { AdminRevenueMonthPoint } from "@/types/admin-reports";

type AdminRevenueOperationsChartProps = {
  months: AdminRevenueMonthPoint[];
  showFinancial: boolean;
  showProfit?: boolean;
  showMargin?: boolean;
  /** When false, parent owns the legend UI. */
  renderLegend?: boolean;
};

export function AdminRevenueOperationsChart({
  months,
  showFinancial,
  showProfit: showProfitProp,
  showMargin: showMarginProp,
  renderLegend = true,
}: AdminRevenueOperationsChartProps) {
  const tipId = useId();
  const [internalProfit, setInternalProfit] = useState(true);
  const [internalMargin, setInternalMargin] = useState(true);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const showProfit = showProfitProp ?? internalProfit;
  const showMargin = showMarginProp ?? internalMargin;
  const controlsInternal = showProfitProp === undefined;

  const width = 720;
  const height = 360;
  const padX = 24;
  const padY = 20;
  const chartW = width - padX * 2;
  const chartH = height - padY * 2;

  const maxProfit = Math.max(1, ...months.map((m) => m.operatingProfit));
  const maxMargin = Math.max(1, ...months.map((m) => m.grossMarginPct));
  const colW = chartW / Math.max(months.length, 1);

  const active =
    activeIndex !== null && months[activeIndex]
      ? {
          index: activeIndex,
          month: months[activeIndex]!,
          x: padX + activeIndex * colW + colW / 2,
        }
      : null;

  function indexFromClientX(clientX: number, svg: SVGSVGElement): number | null {
    if (months.length === 0) return null;
    const rect = svg.getBoundingClientRect();
    const xSvg = ((clientX - rect.left) / rect.width) * width;
    const idx = Math.floor((xSvg - padX) / colW);
    return Math.min(Math.max(idx, 0), months.length - 1);
  }

  return (
    <div className="admin-reports-chart-wrap">
      {renderLegend && showFinancial && controlsInternal ? (
        <div
          className="admin-reports-legend admin-reports-legend--interactive"
          role="group"
          aria-label="Chart series"
        >
          <button
            type="button"
            className={`admin-reports-legend-item admin-reports-legend-item--btn${
              showProfit ? "" : " is-off"
            }`}
            aria-pressed={showProfit}
            onClick={() => setInternalProfit((v) => !v)}
          >
            <span className="admin-reports-legend-swatch admin-reports-legend-swatch--gold" />
            OPERATING PROFIT
          </button>
          <button
            type="button"
            className={`admin-reports-legend-item admin-reports-legend-item--btn${
              showMargin ? "" : " is-off"
            }`}
            aria-pressed={showMargin}
            onClick={() => setInternalMargin((v) => !v)}
          >
            <span className="admin-reports-legend-swatch admin-reports-legend-swatch--muted" />
            GROSS MARGIN
          </button>
        </div>
      ) : null}

      <div className="admin-reports-chart-stage">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="admin-reports-chart-svg"
          role="img"
          aria-label={
            showFinancial
              ? "Revenue operations chart for the last twelve months"
              : "Mission operations chart for the last twelve months"
          }
          onMouseMove={(e) => {
            setActiveIndex(indexFromClientX(e.clientX, e.currentTarget));
          }}
          onMouseLeave={() => setActiveIndex(null)}
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
                stroke={
                  activeIndex === index
                    ? "rgba(216,179,57,0.28)"
                    : "rgba(244,241,234,0.06)"
                }
                strokeWidth="1"
              />
            );
          })}

          {months.map((month, index) => {
            const x = padX + index * colW + colW / 2;
            const profitLen =
              (month.operatingProfit / maxProfit) * (chartW * 0.22);
            const marginLen = showFinancial
              ? (month.grossMarginPct / maxMargin) * (chartW * 0.14)
              : 0;
            const yProfit = padY + chartH * 0.35;
            const yMargin = padY + chartH * 0.62;
            const activeBoost = activeIndex === index ? 1.15 : 1;

            return (
              <g key={month.monthLabel}>
                {showProfit ? (
                  <line
                    x1={x - (profitLen * activeBoost) / 2}
                    y1={yProfit}
                    x2={x + (profitLen * activeBoost) / 2}
                    y2={yProfit}
                    stroke="var(--color-gold)"
                    strokeWidth={activeIndex === index ? 4 : 3}
                    strokeLinecap="round"
                    pointerEvents="none"
                  />
                ) : null}
                {showFinancial && showMargin ? (
                  <line
                    x1={x - (marginLen * activeBoost) / 2}
                    y1={yMargin}
                    x2={x + (marginLen * activeBoost) / 2}
                    y2={yMargin}
                    stroke="rgba(168,162,154,0.55)"
                    strokeWidth={activeIndex === index ? 3.25 : 2.5}
                    strokeLinecap="round"
                    pointerEvents="none"
                  />
                ) : null}
                <rect
                  x={x - colW / 2}
                  y={padY}
                  width={colW}
                  height={chartH}
                  fill="transparent"
                  tabIndex={0}
                  role="button"
                  aria-describedby={activeIndex === index ? tipId : undefined}
                  aria-label={`${month.monthLabel}: profit ${month.operatingProfit}, margin ${month.grossMarginPct}%`}
                  onFocus={() => setActiveIndex(index)}
                  onClick={() =>
                    setActiveIndex((prev) => (prev === index ? null : index))
                  }
                />
              </g>
            );
          })}
        </svg>

        {active ? (
          <div
            id={tipId}
            className="admin-reports-chart-tooltip"
            style={{ left: `${(active.x / width) * 100}%` }}
            role="status"
          >
            <p className="admin-reports-chart-tooltip-label">
              {active.month.monthLabel}
            </p>
            {showProfit ? (
              <p className="admin-reports-chart-tooltip-row">
                Profit {active.month.operatingProfit.toLocaleString()}
              </p>
            ) : null}
            {showFinancial && showMargin ? (
              <p className="admin-reports-chart-tooltip-row">
                Margin {active.month.grossMarginPct.toFixed(1)}%
              </p>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="admin-reports-chart-months">
        {months.map((month, index) => (
          <button
            key={month.monthLabel}
            type="button"
            className={`admin-reports-chart-month admin-reports-chart-month--btn${
              activeIndex === index ? " is-active" : ""
            }`}
            onClick={() =>
              setActiveIndex((prev) => (prev === index ? null : index))
            }
          >
            {month.monthShort}
          </button>
        ))}
      </div>
    </div>
  );
}
