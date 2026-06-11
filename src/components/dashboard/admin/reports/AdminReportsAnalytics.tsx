import { AdminReportsExportButton } from "@/components/dashboard/admin/reports/AdminReportsExportButton";
import { AdminReportsFooterStrip } from "@/components/dashboard/admin/reports/AdminReportsFooterStrip";
import { AdminRevenueOperationsChart } from "@/components/dashboard/admin/reports/AdminRevenueOperationsChart";
import type { AdminReportsAnalyticsData } from "@/types/admin-reports";

type AdminReportsAnalyticsProps = {
  data: AdminReportsAnalyticsData;
};

export function AdminReportsAnalytics({ data }: AdminReportsAnalyticsProps) {
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

      <section className="admin-reports-stats-grid" aria-label="Report summary statistics">
        {data.stats.map((stat) => (
          <article key={stat.label} className="admin-reports-stat-card">
            <p className="admin-reports-stat-label">{stat.label}</p>
            <p className="admin-reports-stat-value">{stat.value}</p>
            <p
              className={`admin-reports-stat-sub${
                stat.subtextTone === "success" ? " admin-reports-stat-sub--success" : ""
              }`}
            >
              {stat.subtext}
            </p>
          </article>
        ))}
      </section>

      <div className="admin-reports-main-grid">
        <section className="admin-reports-panel admin-reports-panel--chart">
          <div className="admin-reports-panel-head">
            <div>
              <h2 className="admin-reports-panel-title">{data.chartTitle}</h2>
              <p className="admin-reports-panel-sub">{data.chartSubtitle}</p>
            </div>
            {data.showFinancialChart ? (
              <div className="admin-reports-legend">
                <span className="admin-reports-legend-item">
                  <span className="admin-reports-legend-swatch admin-reports-legend-swatch--gold" />
                  OPERATING PROFIT
                </span>
                <span className="admin-reports-legend-item">
                  <span className="admin-reports-legend-swatch admin-reports-legend-swatch--muted" />
                  GROSS MARGIN
                </span>
              </div>
            ) : null}
          </div>
          <AdminRevenueOperationsChart
            months={data.revenueMonths}
            showFinancial={data.showFinancialChart}
          />
        </section>

        <section className="admin-reports-panel admin-reports-panel--categories">
          <h2 className="admin-reports-panel-title">TOP MISSION CATEGORIES</h2>
          <ul className="admin-reports-category-list">
            {data.missionCategories.map((row) => (
              <li key={row.id} className="admin-reports-category-row">
                <div className="admin-reports-category-head">
                  <span className="admin-reports-category-label">{row.label}</span>
                  <span className="admin-reports-category-pct">{row.pct}%</span>
                </div>
                <div className="admin-reports-category-track">
                  <span
                    className="admin-reports-category-fill"
                    style={{ width: `${row.pct}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
          <div className="admin-reports-segment-footer">
            <span className="admin-reports-segment-link">
              VIEW FULL SEGMENTATION REPORT
            </span>
          </div>
        </section>
      </div>

      <AdminReportsFooterStrip
        metrics={data.footerMetrics}
        syncedAt={data.syncedAt}
      />
    </div>
  );
}
