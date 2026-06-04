import { cn } from "@/lib/utils";

/** Vertical rhythm matching public pilot profile (`space-y-8 sm:space-y-10`). */
export function DashboardPageLayout({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-8 sm:space-y-10", className)}>{children}</div>
  );
}
