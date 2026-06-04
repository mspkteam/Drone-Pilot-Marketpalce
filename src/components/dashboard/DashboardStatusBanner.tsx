import { cn } from "@/lib/utils";

type DashboardStatusBannerProps = {
  children: React.ReactNode;
  variant?: "gold" | "muted";
  className?: string;
};

export function DashboardStatusBanner({
  children,
  variant = "gold",
  className,
}: DashboardStatusBannerProps) {
  return (
    <p
      role="status"
      className={cn(
        "rounded-lg border px-4 py-3 text-sm",
        variant === "gold" &&
          "border-gold/30 bg-gold/10 text-gold-dark",
        variant === "muted" &&
          "border-border bg-surface/50 text-muted-foreground",
        className,
      )}
    >
      {children}
    </p>
  );
}
