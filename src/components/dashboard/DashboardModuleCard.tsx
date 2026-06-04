import { DashboardIconBox } from "@/components/dashboard/DashboardIconBox";
import { cn } from "@/lib/utils";

type DashboardModuleCardProps = {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
};

/** Module card — matches public profile `ProfileModuleCard` grid cells. */
export function DashboardModuleCard({
  title,
  icon,
  children,
  className,
  action,
}: DashboardModuleCardProps) {
  return (
    <article
      className={cn(
        "premium-card flex h-full flex-col p-6 transition-shadow duration-200",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3 border-b border-border/80 pb-4">
        <div className="flex min-w-0 items-center gap-3">
          {icon ? <DashboardIconBox size="md">{icon}</DashboardIconBox> : null}
          <h2 className="text-base font-semibold text-foreground">{title}</h2>
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <div className="mt-5 flex-1">{children}</div>
    </article>
  );
}
