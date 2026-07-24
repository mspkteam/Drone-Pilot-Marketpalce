import type { ClientProfileStatus } from "@/types/client";

export function getClientProfileStatusLabel(status: ClientProfileStatus): string {
  const labels: Record<ClientProfileStatus, string> = {
    draft: "Draft",
    active: "Active",
    pending_review: "Pending review",
    suspended: "Suspended",
  };
  return labels[status] ?? status;
}
