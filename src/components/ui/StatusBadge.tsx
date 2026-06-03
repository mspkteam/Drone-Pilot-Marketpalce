import { cn } from "@/lib/utils";

export type StatusBadgeTone = "neutral" | "warning" | "success" | "error" | "info";

/** Shared status badge tones — use via `<StatusBadge tone="warning">` */
export const statusBadgeToneClass: Record<StatusBadgeTone, string> = {
  neutral: "status-badge-neutral",
  warning: "status-badge-warning",
  success: "status-badge-success",
  error: "status-badge-error",
  info: "status-badge-info",
};

type StatusBadgeProps = {
  tone: StatusBadgeTone;
  children: React.ReactNode;
  className?: string;
};

export function StatusBadge({ tone, children, className }: StatusBadgeProps) {
  return (
    <span className={cn("status-badge", statusBadgeToneClass[tone], className)}>
      {children}
    </span>
  );
}
