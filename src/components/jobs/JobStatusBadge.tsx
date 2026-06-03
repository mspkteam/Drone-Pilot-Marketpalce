import { getJobStatusLabel, getJobStatusTone } from "@/lib/jobs/status";
import type { JobStatus } from "@/types/job";
import { cn } from "@/lib/utils";

const toneClasses = {
  neutral: "bg-surface text-muted-foreground border-border",
  warning: "bg-gold/15 text-gold-light border-gold/40",
  success: "bg-emerald-500/15 text-emerald-300 border-emerald-500/35",
  error: "bg-destructive/15 text-red-300 border-destructive/40",
};

export function JobStatusBadge({ status }: { status: JobStatus }) {
  const tone = getJobStatusTone(status);
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium",
        toneClasses[tone],
      )}
    >
      {getJobStatusLabel(status)}
    </span>
  );
}
