import { BadgeWingIcon, resolveBadgeIconType } from "@/components/admin/badges/BadgeWingIcon";
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
  const iconType = resolveBadgeIconType(iconLabel);

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
      <span
        className={cn(
          "inline-flex shrink-0 items-center justify-center rounded-full bg-background/60 text-current",
          size === "sm" ? "size-5" : "size-6",
        )}
        aria-hidden
      >
        <BadgeWingIcon
          type={iconType}
          className={size === "sm" ? "size-3.5" : "size-4"}
        />
      </span>
      <span>{title}</span>
    </span>
  );
}
