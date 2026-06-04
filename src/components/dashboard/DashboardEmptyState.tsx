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
    <div className={cn("empty-state", className)}>
      {title ? (
        <h3 className="text-base font-medium text-foreground">{title}</h3>
      ) : null}
      <p className={cn(title && "mt-2")}>{message}</p>
      {children ? (
        <div className="mt-6 flex flex-wrap justify-center gap-3">{children}</div>
      ) : null}
    </div>
  );
}
