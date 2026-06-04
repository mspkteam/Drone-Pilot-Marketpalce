import { DashboardIconBox } from "@/components/dashboard/DashboardIconBox";
import { cn } from "@/lib/utils";

type ActivityCardProps = {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
};

/**
 * Recent activity / list panel wrapper — dark card with list-panel inside.
 */
export function ActivityCard({
  title,
  description,
  icon,
  children,
  footer,
  className,
}: ActivityCardProps) {
  return (
    <article
      className={cn(
        "premium-card flex h-full flex-col overflow-hidden p-0",
        className,
      )}
    >
      <div className="border-b border-border/80 px-5 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          {icon ? <DashboardIconBox size="sm">{icon}</DashboardIconBox> : null}
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-foreground">{title}</h3>
            {description ? (
              <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
            ) : null}
          </div>
        </div>
      </div>
      <div className="flex-1">{children}</div>
      {footer ? (
        <div className="border-t border-border/80 px-5 py-3 sm:px-6">{footer}</div>
      ) : null}
    </article>
  );
}
