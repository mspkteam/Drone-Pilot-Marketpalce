"use client";

import { useMemo, useState } from "react";
import { AdminReportsExportButton } from "@/components/dashboard/admin/reports/AdminReportsExportButton";
import { AdminReportsFooterStrip } from "@/components/dashboard/admin/reports/AdminReportsFooterStrip";
import { AdminRevenueOperationsChart } from "@/components/dashboard/admin/reports/AdminRevenueOperationsChart";
import type { AdminReportsAnalyticsData } from "@/types/admin-reports";

type AdminReportsAnalyticsProps = {
  data: AdminReportsAnalyticsData;
};

export function AdminReportsAnalytics({ data }: AdminReportsAnalyticsProps) {
  const [selectedStat, setSelectedStat] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );
  const [segmentationOpen, setSegmentationOpen] = useState(false);

  const selectedStatCard = useMemo(
    () => data.stats.find((s) => s.label === selectedStat) ?? null,
    [data.stats, selectedStat],
  );

  const selectedCategory = useMemo(
    () =>
      data.missionCategories.find((c) => c.id === selectedCategoryId) ?? null,
    [data.missionCategories, selectedCategoryId],
  );

  const sortedCategories = useMemo(() => {
    const rows = [...data.missionCategories];
    rows.sort((a, b) => b.pct - a.pct);
    return rows;
  }, [data.missionCategories]);

  return (
    <div className="admin-reports-page">
      <section
        className="admin-reports-hero admin-ops-bracket-card"
        aria-label="Reports and analytics"
      >
        <div className="admin-ops-hero-glow" aria-hidden />
        <div className="admin-reports-hero-inner">
          <div className="admin-reports-hero-copy">
            <p className="admin-ops-eyebrow">FINANCIAL OVERSIGHT</p>
            <h1 className="admin-reports-hero-title">Reports &amp; Analytics</h1>
            <p className="admin-reports-hero-desc">
              Track revenue, mission volume, pilot growth and client acquisition
              over time.
            </p>
          </div>
          <AdminReportsExportButton exportRows={data.exportRows} />
        </div>
      </section>

      <section
        className="admin-reports-stats-grid"
        aria-label="Report summary statistics"
      >
        {data.stats.map((stat) => {
          const isSelected = selectedStat === stat.label;
          return (
            <button
              key={stat.label}
              type="button"
              className={`admin-reports-stat-card admin-reports-stat-card--btn${
                isSelected ? " is-selected" : ""
              }`}
              aria-pressed={isSelected}
              onClick={() =>
                setSelectedStat((prev) =>
                  prev === stat.label ? null : stat.label,
                )
              }
            >
              <p className="admin-reports-stat-label">{stat.label}</p>
              <p className="admin-reports-stat-value">{stat.value}</p>
              <p
                className={`admin-reports-stat-sub${
                  stat.subtextTone === "success"
                    ? " admin-reports-stat-sub--success"
                    : ""
                }`}
              >
                {stat.subtext}
              </p>
            </button>
          );
        })}
      </section>

      {selectedStatCard ? (
        <p className="admin-reports-selection-detail" role="status">
          Selected metric: <strong>{selectedStatCard.label}</strong> —{" "}
          {selectedStatCard.value} ({selectedStatCard.subtext})
        </p>
      ) : null}

      <div className="admin-reports-main-grid">
        <section className="admin-reports-panel admin-reports-panel--chart">
          <div className="admin-reports-panel-head">
            <div>
              <h2 className="admin-reports-panel-title">{data.chartTitle}</h2>
              <p className="admin-reports-panel-sub">{data.chartSubtitle}</p>
            </div>
            {data.showFinancialChart ? (
              <p className="admin-reports-panel-hint">
                Hover or tap months · toggle series in the legend
              </p>
            ) : (
              <p className="admin-reports-panel-hint">
                Hover or tap months for detail
              </p>
            )}
          </div>
          <AdminRevenueOperationsChart
            months={data.revenueMonths}
            showFinancial={data.showFinancialChart}
          />
        </section>

        <section className="admin-reports-panel admin-reports-panel--categories">
          <h2 className="admin-reports-panel-title">TOP MISSION CATEGORIES</h2>
          <ul className="admin-reports-category-list">
            {data.missionCategories.map((row) => {
              const isSelected = selectedCategoryId === row.id;
              return (
                <li key={row.id}>
                  <button
                    type="button"
                    className={`admin-reports-category-row admin-reports-category-row--btn${
                      isSelected ? " is-selected" : ""
                    }`}
                    aria-pressed={isSelected}
                    onClick={() =>
                      setSelectedCategoryId((prev) =>
                        prev === row.id ? null : row.id,
                      )
                    }
                  >
                    <div className="admin-reports-category-head">
                      <span className="admin-reports-category-label">
                        {row.label}
                      </span>
                      <span className="admin-reports-category-pct">
                        {row.pct}%
                      </span>
                    </div>
                    <div className="admin-reports-category-track">
                      <span
                        className="admin-reports-category-fill"
                        style={{ width: `${row.pct}%` }}
                      />
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>

          {selectedCategory ? (
            <p className="admin-reports-category-detail" role="status">
              {selectedCategory.label} accounts for{" "}
              <strong>{selectedCategory.pct}%</strong> of tracked mission
              volume in this window.
            </p>
          ) : null}

          <div className="admin-reports-segment-footer">
            <button
              type="button"
              className={`admin-reports-segment-link admin-reports-segment-link--btn${
                segmentationOpen ? " is-open" : ""
              }`}
              aria-expanded={segmentationOpen}
              onClick={() => setSegmentationOpen((v) => !v)}
            >
              {segmentationOpen
                ? "HIDE SEGMENTATION REPORT"
                : "VIEW FULL SEGMENTATION REPORT"}
            </button>
          </div>

          {segmentationOpen ? (
            <div className="admin-reports-segmentation" role="region" aria-label="Full segmentation">
              <ol className="admin-reports-segmentation-list">
                {sortedCategories.map((row, index) => (
                  <li key={row.id}>
                    <span className="admin-reports-segmentation-rank">
                      #{index + 1}
                    </span>
                    <span className="admin-reports-segmentation-label">
                      {row.label}
                    </span>
                    <span className="admin-reports-segmentation-pct">
                      {row.pct}%
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          ) : null}
        </section>
      </div>

      <AdminReportsFooterStrip
        metrics={data.footerMetrics}
        syncedAt={data.syncedAt}
      />
    </div>
  );
}
