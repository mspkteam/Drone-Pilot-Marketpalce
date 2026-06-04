import { cn } from "@/lib/utils";

type DashboardIconBoxProps = {
  children: React.ReactNode;
  className?: string;
  size?: "sm" | "md";
};

/** Gold-bordered icon container — matches public pilot profile modules. */
export function DashboardIconBox({
  children,
  className,
  size = "md",
}: DashboardIconBoxProps) {
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-lg border border-gold/35 bg-gold/10 text-gold",
        size === "sm" ? "h-9 w-9" : "h-10 w-10 sm:h-11 sm:w-11",
        className,
      )}
      aria-hidden
    >
      {children}
    </span>
  );
}
