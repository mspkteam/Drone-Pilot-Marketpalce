export type JobRiskLevel = "low" | "medium" | "high";

export type JobApprovalStatusFilter =
  | "all"
  | "pending_approval"
  | "open"
  | "rejected";

export type JobApprovalStatCard = {
  label: string;
  value: string;
  subtext: string;
  tone: "gold" | "success" | "neutral" | "danger";
  /** Status tab this card jumps to when clicked. */
  statusFilter?: JobApprovalStatusFilter;
};

export type JobApprovalQueueRow = {
  id: string;
  missionId: string;
  title: string;
  postedBy: string;
  location: string;
  budget: string;
  status: string;
  statusLabel: string;
  riskLevel: JobRiskLevel;
  riskLabel: string;
  isNightOp: boolean;
  reviewHref: string;
};

export type JobApprovalQueueData = {
  stats: JobApprovalStatCard[];
  rows: JobApprovalQueueRow[];
  totalPending: number;
  totalMatching: number;
  statusFilter: JobApprovalStatusFilter;
  usingMockRows: boolean;
};
