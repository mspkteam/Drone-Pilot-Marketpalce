import { cn } from "@/lib/utils";

type DashboardEmptyStateProps = {
  title?: string;
  message: string;
  children?: React.ReactNode;
  className?: string;
};

export function DashboardEmptyState({
  title,
  message,
  children,
  className,
}: DashboardEmptyStateProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-dashed border-border bg-surface/40 px-4 py-8 text-center sm:px-6 sm:py-10",
        className,
      )}
    >
      {title ? (
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
      ) : null}
      <p className={cn("text-sm text-muted-foreground", title && "mt-2")}>
        {message}
      </p>
      {children ? (
        <div className="mt-6 flex flex-wrap justify-center gap-3">{children}</div>
      ) : null}
    </div>
  );
}
