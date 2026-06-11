export type AdminReportsStatCard = {
  label: string;
  value: string;
  subtext: string;
  subtextTone?: "success" | "muted";
};

export type AdminRevenueMonthPoint = {
  monthLabel: string;
  monthShort: string;
  operatingProfit: number;
  grossMarginPct: number;
};

export type AdminMissionCategoryRow = {
  id: string;
  label: string;
  pct: number;
};

export type AdminReportsFooterMetric = {
  label: string;
  value: string;
  tone?: "gold" | "default" | "warning";
};

export type AdminReportsExportRow = {
  section: string;
  label: string;
  value: string;
};

export type AdminReportsAnalyticsData = {
  isSuperAdmin: boolean;
  stats: AdminReportsStatCard[];
  revenueMonths: AdminRevenueMonthPoint[];
  missionCategories: AdminMissionCategoryRow[];
  footerMetrics: AdminReportsFooterMetric[];
  showFinancialChart: boolean;
  chartTitle: string;
  chartSubtitle: string;
  exportRows: AdminReportsExportRow[];
  syncedAt: string;
};
