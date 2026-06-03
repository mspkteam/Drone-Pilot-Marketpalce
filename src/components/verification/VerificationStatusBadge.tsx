import {
  getVerificationStatusLabel,
  getVerificationStatusTone,
} from "@/lib/verification/status";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { VerificationStatus } from "@/types/verification";

export function VerificationStatusBadge({
  status,
}: {
  status: VerificationStatus;
}) {
  const tone = getVerificationStatusTone(status);
  return (
    <StatusBadge tone={tone}>{getVerificationStatusLabel(status)}</StatusBadge>
  );
}
