import { getProfileStatusLabel } from "@/lib/pilot/status";
import type { PilotProfileStatus } from "@/types/pilot";
import { cn } from "@/lib/utils";

const toneClasses: Record<
  PilotProfileStatus,
  string
> = {
  draft: "bg-surface text-muted-foreground border-border",
  pending_review: "bg-gold/10 text-gold-dark border-gold/30",
  approved: "bg-emerald-500/10 text-emerald-800 border-emerald-500/30",
  rejected: "bg-destructive/10 text-destructive border-destructive/30",
  suspended: "bg-destructive/10 text-destructive border-destructive/30",
};

export function PilotStatusBadge({ status }: { status: PilotProfileStatus }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium",
        toneClasses[status],
      )}
    >
      {getProfileStatusLabel(status)}
    </span>
  );
}
