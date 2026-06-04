import { DashboardSection } from "@/components/dashboard/DashboardSection";
import { cn } from "@/lib/utils";

type DashboardTableProps = {
  eyebrow?: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  wrapClassName?: string;
};

/**
 * Dark premium table shell — uses `.data-table-wrap` / `.data-table` from globals.
 * Pass a `<table className="data-table">` as children.
 */
export function DashboardTable({
  eyebrow,
  title,
  description,
  action,
  children,
  className,
  wrapClassName,
}: DashboardTableProps) {
  return (
    <DashboardSection
      eyebrow={eyebrow}
      title={title}
      description={description}
      action={action}
      className={className}
    >
      <div className={cn("data-table-wrap", wrapClassName)}>{children}</div>
    </DashboardSection>
  );
}
