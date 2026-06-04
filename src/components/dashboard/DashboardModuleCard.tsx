import { DashboardIconBox } from "@/components/dashboard/DashboardIconBox";
import { cn } from "@/lib/utils";

type DashboardModuleCardProps = {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
};

/** Module card — matches public pilot profile `ProfileModuleCard`. */
export function DashboardModuleCard({
  title,
  icon,
  children,
  className,
  action,
}: DashboardModuleCardProps) {
  return (
    <article className={cn("dashboard-card flex h-full flex-col p-6", className)}>
      <div className="dashboard-card-header">
        <div>
          {icon ? <DashboardIconBox size="md">{icon}</DashboardIconBox> : null}
          <h2 className="truncate text-base font-semibold text-foreground">
            {title}
          </h2>
        </div>
        {action ? <div className="shrink-0 self-center">{action}</div> : null}
      </div>
      <div className="dashboard-card-body">{children}</div>
    </article>
  );
}
