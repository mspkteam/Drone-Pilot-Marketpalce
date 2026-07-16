"use client";

import { useId, useState } from "react";
import type { AdminGrowthSeriesPoint } from "@/types/admin-operations";

type AdminPlatformGrowthPanelProps = {
  series: AdminGrowthSeriesPoint[];
};

export function AdminPlatformGrowthPanel({
  series,
}: AdminPlatformGrowthPanelProps) {
  const tipId = useId();
  const [showMissions, setShowMissions] = useState(true);
  const [showPilots, setShowPilots] = useState(true);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

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
    const y = padY + chartH - (point.missionsCompleted / maxY) * chartH;
    return { x, y, value: point.missionsCompleted };
  });

  const pilotPoints = series.map((point, index) => {
    const x = padX + (index / Math.max(series.length - 1, 1)) * chartW;
    const y = padY + chartH - (point.newPilotsOnboarded / maxY) * chartH;
    return { x, y, value: point.newPilotsOnboarded };
  });

  const linePath = missionPoints
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");

  const areaPath = `${linePath} L ${missionPoints[missionPoints.length - 1]!.x.toFixed(1)} ${(padY + chartH).toFixed(1)} L ${missionPoints[0]!.x.toFixed(1)} ${(padY + chartH).toFixed(1)} Z`;

  const pilotLinePath = pilotPoints
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");

  const gridLines = [0.25, 0.5, 0.75].map((ratio) => padY + chartH * (1 - ratio));

  const active =
    activeIndex !== null && series[activeIndex]
      ? {
          index: activeIndex,
          point: series[activeIndex]!,
          x: missionPoints[activeIndex]!.x,
        }
      : null;

  function indexFromClientX(clientX: number, svg: SVGSVGElement): number | null {
    if (series.length === 0) return null;
    const rect = svg.getBoundingClientRect();
    const xSvg = ((clientX - rect.left) / rect.width) * width;
    const t = (xSvg - padX) / chartW;
    const idx = Math.round(t * Math.max(series.length - 1, 1));
    return Math.min(Math.max(idx, 0), series.length - 1);
  }

  return (
    <section className="admin-ops-panel admin-ops-panel--growth">
      <div className="admin-ops-panel-head">
        <div>
          <h2 className="admin-ops-panel-title">PLATFORM GROWTH</h2>
          <p className="admin-ops-panel-sub">Mission volume — last 90 days</p>
        </div>
        <div className="admin-ops-legend" role="group" aria-label="Chart series">
          <button
            type="button"
            className={`admin-ops-legend-item admin-ops-legend-item--btn${
              showMissions ? "" : " is-off"
            }`}
            aria-pressed={showMissions}
            onClick={() => setShowMissions((v) => !v)}
          >
            <span className="admin-ops-legend-dot admin-ops-legend-dot--gold" />
            Missions completed
          </button>
          <button
            type="button"
            className={`admin-ops-legend-item admin-ops-legend-item--btn${
              showPilots ? "" : " is-off"
            }`}
            aria-pressed={showPilots}
            onClick={() => setShowPilots((v) => !v)}
          >
            <span className="admin-ops-legend-dot admin-ops-legend-dot--green" />
            New officers onboarded
          </button>
        </div>
      </div>

      <div className="admin-ops-chart-wrap">
        <div className="admin-ops-chart-stage">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="admin-ops-chart-svg"
            role="img"
            aria-label="Platform growth chart for missions completed and new pilots onboarded over the last 90 days. Hover or focus weeks for details. Toggle series with the legend."
            onMouseMove={(e) => {
              setActiveIndex(indexFromClientX(e.clientX, e.currentTarget));
            }}
            onMouseLeave={() => setActiveIndex(null)}
          >
            <defs>
              <linearGradient
                id="admin-ops-gold-fill"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
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

            {showMissions ? (
              <>
                <path d={areaPath} fill="url(#admin-ops-gold-fill)" />
                <path
                  d={linePath}
                  fill="none"
                  stroke="var(--color-gold)"
                  strokeWidth="2.25"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              </>
            ) : null}

            {showPilots ? (
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
            ) : null}

            {active ? (
              <line
                x1={active.x}
                y1={padY}
                x2={active.x}
                y2={padY + chartH}
                stroke="rgba(216,179,57,0.35)"
                strokeWidth="1"
                strokeDasharray="3 3"
                pointerEvents="none"
              />
            ) : null}

            {showMissions
              ? missionPoints.map((p, i) => (
                  <circle
                    key={`m-${i}`}
                    cx={p.x}
                    cy={p.y}
                    r={activeIndex === i ? 4.5 : 2.5}
                    fill="var(--color-gold)"
                    pointerEvents="none"
                  />
                ))
              : null}

            {showPilots
              ? pilotPoints.map((p, i) => (
                  <circle
                    key={`p-${i}`}
                    cx={p.x}
                    cy={p.y}
                    r={activeIndex === i ? 3.5 : 2}
                    fill="var(--color-success-bright)"
                    opacity={0.9}
                    pointerEvents="none"
                  />
                ))
              : null}

            {series.map((_, i) => {
              const x = missionPoints[i]!.x;
              const hitW = chartW / Math.max(series.length, 1);
              return (
                <rect
                  key={`hit-${i}`}
                  x={x - hitW / 2}
                  y={padY}
                  width={hitW}
                  height={chartH}
                  fill="transparent"
                  tabIndex={0}
                  role="button"
                  aria-describedby={activeIndex === i ? tipId : undefined}
                  aria-label={`${series[i]!.label}: ${series[i]!.missionsCompleted} missions, ${series[i]!.newPilotsOnboarded} new officers`}
                  onMouseEnter={() => setActiveIndex(i)}
                  onFocus={() => setActiveIndex(i)}
                  onClick={() =>
                    setActiveIndex((prev) => (prev === i ? null : i))
                  }
                />
              );
            })}
          </svg>

          {active ? (
            <div
              id={tipId}
              className="admin-ops-chart-tooltip"
              style={{ left: `${(active.x / width) * 100}%` }}
              role="status"
            >
              <p className="admin-ops-chart-tooltip-label">{active.point.label}</p>
              {showMissions ? (
                <p className="admin-ops-chart-tooltip-row">
                  <span className="admin-ops-legend-dot admin-ops-legend-dot--gold" />
                  Missions {active.point.missionsCompleted}
                </p>
              ) : null}
              {showPilots ? (
                <p className="admin-ops-chart-tooltip-row">
                  <span className="admin-ops-legend-dot admin-ops-legend-dot--green" />
                  Officers {active.point.newPilotsOnboarded}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="admin-ops-chart-labels" aria-hidden={false}>
          {series.map((point, i) => (
            <button
              key={point.label}
              type="button"
              className={`admin-ops-chart-label admin-ops-chart-label--btn${
                activeIndex === i ? " is-active" : ""
              }`}
              onClick={() =>
                setActiveIndex((prev) => (prev === i ? null : i))
              }
            >
              {point.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
