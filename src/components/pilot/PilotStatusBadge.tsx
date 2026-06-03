import { getProfileStatusLabel } from "@/lib/pilot/status";
import { StatusBadge, type StatusBadgeTone } from "@/components/ui/StatusBadge";
import type { PilotProfileStatus } from "@/types/pilot";

const statusTone: Record<PilotProfileStatus, StatusBadgeTone> = {
  draft: "neutral",
  pending_review: "warning",
  approved: "success",
  rejected: "error",
  suspended: "error",
};

export function PilotStatusBadge({ status }: { status: PilotProfileStatus }) {
  return (
    <StatusBadge tone={statusTone[status]}>
      {getProfileStatusLabel(status)}
    </StatusBadge>
  );
}
