import type { DisputeListItemDto } from "@/types/dispute";

export type DisputePriority = "low" | "medium" | "high";

export type AdminDisputeStatCard = {
  label: string;
  value: string;
  subtext: string;
  tone: "gold" | "success" | "neutral" | "warning";
};

export type AdminDisputeCenterRow = {
  id: string;
  disputeId: string;
  missionId: string;
  priority: DisputePriority;
  priorityLabel: string;
  title: string;
  description: string;
  openedLabel: string;
  status: DisputeListItemDto["status"];
  detailHref: string;
  isMock?: boolean;
};

export type AdminDisputeCenterData = {
  stats: AdminDisputeStatCard[];
  usingMockStats: boolean;
};
