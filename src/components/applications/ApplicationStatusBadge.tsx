import {
  getApplicationStatusLabel,
  getApplicationStatusTone,
} from "@/lib/applications/status";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { ApplicationStatus } from "@/types/application";

export function ApplicationStatusBadge({ status }: { status: ApplicationStatus }) {
  const tone = getApplicationStatusTone(status);
  return (
    <StatusBadge tone={tone}>{getApplicationStatusLabel(status)}</StatusBadge>
  );
}
