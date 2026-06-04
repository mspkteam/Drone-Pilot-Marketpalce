import { cn } from "@/lib/utils";

/** Gold pill chip — matches public pilot profile service chips. */
export function DashboardChip({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <span className={cn("dashboard-chip", className)}>{children}</span>;
}
