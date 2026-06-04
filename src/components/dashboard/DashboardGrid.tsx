import { cn } from "@/lib/utils";

/** Stats row — 1 / 2 / 4 columns (matches public pilot profile). */
export function DashboardStatsGrid({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("dashboard-stats-grid", className)}>{children}</div>;
}

/** Feature modules — 1 / 2 columns (matches public pilot profile extended grid). */
export function DashboardModulesGrid({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("dashboard-modules-grid", className)}>{children}</div>
  );
}
