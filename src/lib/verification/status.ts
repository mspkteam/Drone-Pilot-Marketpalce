import { catalogIdFromNotes } from "@/lib/pilot/verification-documents-catalog";
import { PILOT_VERIFICATION_DOCUMENTS } from "@/lib/pilot/verification-documents-catalog";
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

/** Prefer catalog slot title (e.g. Government ID — Front) when notes tag is present. */
export function getVerificationDocumentLabel(input: {
  type: VerificationType;
  notes?: string | null;
}): string {
  const catalogId = catalogIdFromNotes(input.notes);
  if (catalogId) {
    const match = PILOT_VERIFICATION_DOCUMENTS.find(
      (doc) => doc.catalogId === catalogId,
    );
    if (match) return match.title;
  }
  return getVerificationTypeLabel(input.type);
}

export function getVerificationStatusLabel(status: VerificationStatus): string {
  const labels: Record<VerificationStatus, string> = {
    pending: "Pending review",
    amendments_required: "Amendments required",
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
    case "amendments_required":
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
