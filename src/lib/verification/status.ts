import type { VerificationStatus, VerificationType } from "@/types/verification";

export function getVerificationTypeLabel(type: VerificationType): string {
  const labels: Record<VerificationType, string> = {
    license: "Drone license",
    insurance: "Insurance",
    identity: "Identity",
    other: "Other certification",
  };
  return labels[type];
}

export function getVerificationStatusLabel(status: VerificationStatus): string {
  const labels: Record<VerificationStatus, string> = {
    pending: "Pending review",
    approved: "Approved",
    rejected: "Rejected",
    expired: "Expired",
  };
  return labels[status];
}

export function getVerificationStatusTone(
  status: VerificationStatus,
): "neutral" | "warning" | "success" | "error" {
  switch (status) {
    case "pending":
      return "warning";
    case "approved":
      return "success";
    case "rejected":
    case "expired":
      return "error";
    default:
      return "neutral";
  }
}
