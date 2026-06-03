import type { JobStatus } from "@/types/job";

export function canClientEditJob(status: JobStatus): boolean {
  return status === "draft" || status === "rejected";
}

export function canApproveJob(status: JobStatus): boolean {
  return status === "pending_approval";
}

export function canRejectJob(status: JobStatus): boolean {
  return status === "pending_approval";
}

export function getJobStatusLabel(status: JobStatus): string {
  const labels: Record<JobStatus, string> = {
    draft: "Draft",
    pending_approval: "Pending approval",
    approved: "Approved",
    rejected: "Rejected",
    open: "Open for bids",
    in_bidding: "Receiving bids",
    assigned: "Pilot assigned",
    closed: "Closed",
    cancelled: "Cancelled",
  };
  return labels[status] ?? status;
}

export function getJobStatusTone(
  status: JobStatus,
): "neutral" | "warning" | "success" | "error" {
  switch (status) {
    case "draft":
      return "neutral";
    case "pending_approval":
      return "warning";
    case "approved":
    case "open":
    case "in_bidding":
      return "success";
    case "rejected":
    case "cancelled":
      return "error";
    default:
      return "neutral";
  }
}
