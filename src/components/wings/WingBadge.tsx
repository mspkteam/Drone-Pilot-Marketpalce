import { getWingCategoryLabel } from "@/lib/wings/status";
import type { WingCategory } from "@/types/wing";
import { cn } from "@/lib/utils";

type WingBadgeProps = {
  title: string;
  iconLabel?: string | null;
  category?: WingCategory;
  size?: "sm" | "md";
  className?: string;
};

const categoryTone: Record<WingCategory, string> = {
  milestone: "border-gold/40 bg-gold/15 text-gold-light",
  trust: "border-gold/35 bg-gold/12 text-gold-light",
  community: "border-border bg-surface text-muted-foreground",
};

export function WingBadge({
  title,
  iconLabel,
  category = "milestone",
  size = "sm",
  className,
}: WingBadgeProps) {
  return (
    <span
      title={`${title} · ${getWingCategoryLabel(category)}`}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-medium",
        size === "sm" ? "px-2.5 py-0.5 text-xs" : "px-3 py-1 text-sm",
        categoryTone[category],
        className,
      )}
    >
      {iconLabel ? (
        <span
          className={cn(
            "inline-flex shrink-0 items-center justify-center rounded-full bg-background/60 font-semibold",
            size === "sm" ? "size-5 text-[10px]" : "size-6 text-xs",
          )}
          aria-hidden
        >
          {iconLabel}
        </span>
      ) : null}
      <span>{title}</span>
    </span>
  );
}
