import type {
  DisputeEntryType,
  DisputeResolutionType,
  DisputeStatus,
} from "@/types/dispute";

export function getDisputeStatusTone(
  status: DisputeStatus,
): "neutral" | "warning" | "success" | "error" {
  switch (status) {
    case "resolved":
      return "success";
    case "under_review":
      return "warning";
    case "open":
    default:
      return "error";
  }
}

export function getDisputeStatusLabel(status: DisputeStatus): string {
  const labels: Record<DisputeStatus, string> = {
    open: "Open",
    under_review: "Under review",
    resolved: "Resolved",
  };
  return labels[status] ?? status;
}

export function getDisputeEntryTypeLabel(type: DisputeEntryType): string {
  const labels: Record<DisputeEntryType, string> = {
    note: "Note",
    evidence: "Evidence",
    comment: "Comment",
  };
  return labels[type] ?? type;
}

export function getDisputeResolutionLabel(
  type: DisputeResolutionType,
): string {
  const labels: Record<DisputeResolutionType, string> = {
    full_payout: "Full award to pilot (record only)",
    partial_payout: "Partial award to pilot (record only)",
    refund: "Refund to client (record only)",
  };
  return labels[type] ?? type;
}
