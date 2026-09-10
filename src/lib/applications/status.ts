import type { ApplicationStatus } from "@/types/application";

export function getApplicationStatusLabel(status: ApplicationStatus): string {
  const labels: Record<ApplicationStatus, string> = {
    draft: "Draft",
    submitted: "Submitted",
    withdrawn: "Withdrawn",
    accepted: "Accepted",
    rejected: "Rejected",
    expired: "Expired",
  };
  return labels[status] ?? status;
}

export function canWithdrawApplication(status: ApplicationStatus): boolean {
  return status === "submitted";
}

/** Pilot may revise price/terms while the bid is still open (not accepted). */
export function canReviseApplication(status: ApplicationStatus): boolean {
  return status === "submitted";
}

/** Max increase vs original proposed amount (RAS Media Kit). */
export const PROPOSAL_REVISION_MAX_INCREASE = 0.2;

export function maxRevisedProposalAmount(originalAmount: number): number {
  return Math.round(originalAmount * (1 + PROPOSAL_REVISION_MAX_INCREASE) * 100) / 100;
}

export function getApplicationStatusTone(
  status: ApplicationStatus,
): "neutral" | "warning" | "success" | "error" {
  switch (status) {
    case "accepted":
      return "success";
    case "rejected":
    case "expired":
      return "error";
    case "draft":
      return "neutral";
    case "withdrawn":
      return "neutral";
    case "submitted":
    default:
      return "warning";
  }
}
