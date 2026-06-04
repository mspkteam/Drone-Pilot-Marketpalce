import { cn } from "@/lib/utils";

type DashboardSectionGrid = "stats" | "features" | "none";

type DashboardSectionProps = {
  title: string;
  description?: string;
  action?: React.ReactNode;
  grid?: DashboardSectionGrid;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
};

const gridClass: Record<DashboardSectionGrid, string> = {
  stats: "dashboard-stats-grid",
  features: "dashboard-feature-grid",
  none: "",
};

/**
 * Section wrapper with consistent heading spacing and optional stats/feature grid.
 */
export function DashboardSection({
  title,
  description,
  action,
  grid = "none",
  children,
  className,
  contentClassName,
}: DashboardSectionProps) {
  return (
    <section className={cn("space-y-5", className)}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
            {title}
          </h2>
          {description ? (
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <div className={cn(gridClass[grid], contentClassName)}>{children}</div>
    </section>
  );
}
