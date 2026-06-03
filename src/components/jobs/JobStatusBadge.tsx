import { getJobStatusLabel, getJobStatusTone } from "@/lib/jobs/status";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { JobStatus } from "@/types/job";

export function JobStatusBadge({ status }: { status: JobStatus }) {
  const tone = getJobStatusTone(status);
  return <StatusBadge tone={tone}>{getJobStatusLabel(status)}</StatusBadge>;
}
