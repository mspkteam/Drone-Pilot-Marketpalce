import type { ClientProfileStatus } from "@/types/client";

export function getClientProfileStatusLabel(status: ClientProfileStatus): string {
  const labels: Record<ClientProfileStatus, string> = {
    draft: "Draft",
    active: "Active",
    suspended: "Suspended",
  };
  return labels[status] ?? status;
}
