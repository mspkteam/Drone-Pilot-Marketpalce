export type JobRiskLevel = "low" | "medium" | "high";

export type JobApprovalStatCard = {
  label: string;
  value: string;
  subtext: string;
  tone: "gold" | "success" | "neutral" | "danger";
};

export type JobApprovalQueueRow = {
  id: string;
  missionId: string;
  title: string;
  postedBy: string;
  location: string;
  budget: string;
  riskLevel: JobRiskLevel;
  riskLabel: string;
  isNightOp: boolean;
  reviewHref: string;
};

export type JobApprovalQueueData = {
  stats: JobApprovalStatCard[];
  rows: JobApprovalQueueRow[];
  totalPending: number;
  usingMockRows: boolean;
};
