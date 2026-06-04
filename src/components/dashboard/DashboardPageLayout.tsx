import { cn } from "@/lib/utils";

/** Page rhythm — matches public pilot profile vertical spacing. */
export function DashboardPageLayout({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("dashboard-page", className)}>{children}</div>;
}
