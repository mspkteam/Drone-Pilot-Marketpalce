import type { ApplicationStatus } from "@/types/application";

export function getApplicationStatusLabel(status: ApplicationStatus): string {
  const labels: Record<ApplicationStatus, string> = {
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

export function getApplicationStatusTone(
  status: ApplicationStatus,
): "neutral" | "warning" | "success" | "error" {
  switch (status) {
    case "accepted":
      return "success";
    case "rejected":
    case "expired":
      return "error";
    case "withdrawn":
      return "neutral";
    case "submitted":
    default:
      return "warning";
  }
}
