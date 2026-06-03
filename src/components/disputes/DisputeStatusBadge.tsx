import {
  getDisputeStatusLabel,
  getDisputeStatusTone,
} from "@/lib/disputes/status";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { DisputeStatus } from "@/types/dispute";

export function DisputeStatusBadge({ status }: { status: DisputeStatus }) {
  const tone = getDisputeStatusTone(status);
  return (
    <StatusBadge tone={tone}>{getDisputeStatusLabel(status)}</StatusBadge>
  );
}
