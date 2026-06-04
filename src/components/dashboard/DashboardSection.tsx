import { cn } from "@/lib/utils";

type DashboardSectionProps = {
  eyebrow?: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

/** Section wrapper with optional gold eyebrow — aligns modules and tables. */
export function DashboardSection({
  eyebrow,
  title,
  description,
  action,
  children,
  className,
}: DashboardSectionProps) {
  return (
    <section className={cn("min-w-0", className)}>
      {(eyebrow || title || description || action) && (
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            {eyebrow ? (
              <p className="dashboard-section-eyebrow">{eyebrow}</p>
            ) : null}
            {title ? (
              <h2
                className={cn(
                  "dashboard-section-title",
                  eyebrow && "mt-2",
                )}
              >
                {title}
              </h2>
            ) : null}
            {description ? (
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                {description}
              </p>
            ) : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      )}
      {children}
    </section>
  );
}
