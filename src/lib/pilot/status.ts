import type { PilotProfileStatus } from "@/types/pilot";

export function getProfileStatusLabel(status: PilotProfileStatus): string {
  const labels: Record<PilotProfileStatus, string> = {
    draft: "Draft",
    pending_review: "Pending review",
    approved: "Approved",
    rejected: "Rejected",
    suspended: "Suspended",
  };
  return labels[status] ?? status;
}
