import { cn } from "@/lib/utils";
import type { LucideIcon, LucideProps } from "lucide-react";

export type AppIconProps = LucideProps & {
  icon: LucideIcon;
};

/** Shared Lucide wrapper — stroke icons aligned with dashboard nav (1.5px @ 16–24px). */
export function AppIcon({
  icon: Icon,
  className,
  strokeWidth = 1.75,
  ...props
}: AppIconProps) {
  return (
    <Icon
      className={cn("h-4 w-4 shrink-0", className)}
      strokeWidth={strokeWidth}
      aria-hidden
      {...props}
    />
  );
}
