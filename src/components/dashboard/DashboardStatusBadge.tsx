import { StatusBadge, type StatusBadgeTone } from "@/components/ui/StatusBadge";
import { cn } from "@/lib/utils";

/**
 * Dashboard alias for shared status pills — gold-forward tones match pilot profile.
 * Prefer `warning` for gold operational states; `neutral` for inactive.
 */
export function DashboardStatusBadge({
  tone,
  children,
  className,
}: {
  tone: StatusBadgeTone;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <StatusBadge tone={tone} className={cn(className)}>
      {children}
    </StatusBadge>
  );
}
