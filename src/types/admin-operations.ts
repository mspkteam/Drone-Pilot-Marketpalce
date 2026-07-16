export type AdminOperationsStatCard = {
  label: string;
  value: string;
  subtext: string;
  subtextTone?: "muted" | "success";
};

export type AdminGrowthSeriesPoint = {
  label: string;
  missionsCompleted: number;
  newPilotsOnboarded: number;
};

export type AdminActionQueueTone = "gold" | "red";

export type AdminActionQueueItem = {
  id: string;
  typeLabel: string;
  text: string;
  actionLabel: string;
  href: string;
  tone: AdminActionQueueTone;
  icon: "shield" | "alert" | "user-plus" | "wallet";
};

export type AdminRecentSignup = {
  id: string;
  initials: string;
  name: string;
  timeAgo: string;
  badge: "CLIENT" | "PILOT";
};

export type AdminSystemIntegrityStatus = "healthy" | "degraded" | "critical";

export type AdminSystemIntegrityMetricId = "uptime" | "latency" | "errors";

export type AdminSystemIntegrityMetric = {
  id: AdminSystemIntegrityMetricId;
  label: string;
  value: string;
  fillPct: number;
  detail: string;
};

export type AdminSystemIntegrity = {
  status: AdminSystemIntegrityStatus;
  statusLabel: string;
  stripLabel: string;
  checkedAtLabel: string;
  metrics: AdminSystemIntegrityMetric[];
};

export type AdminOperationsExportRow = {
  section: string;
  label: string;
  value: string;
};

export type AdminOperationsDashboardData = {
  commanderName: string;
  isSuperAdmin: boolean;
  stats: AdminOperationsStatCard[];
  growth: AdminGrowthSeriesPoint[];
  actionQueue: AdminActionQueueItem[];
  recentSignups: AdminRecentSignup[];
  systemIntegrity: AdminSystemIntegrity;
  exportRows: AdminOperationsExportRow[];
};
