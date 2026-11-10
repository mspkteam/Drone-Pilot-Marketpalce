import { BadgeWingIcon, resolveBadgeIconType } from "@/components/admin/badges/BadgeWingIcon";
import { getWingCategoryLabel } from "@/lib/wings/status";
import type { WingCategory } from "@/types/wing";
import { cn } from "@/lib/utils";

type WingBadgeProps = {
  title: string;
  iconLabel?: string | null;
  imageUrl?: string | null;
  category?: WingCategory;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
};

const sizeClasses = {
  sm: {
    shell: "gap-1.5 px-2.5 py-0.5 text-xs",
    image: "size-5",
    iconWrap: "size-5",
    icon: "size-3.5",
  },
  md: {
    shell: "gap-1.5 px-3 py-1 text-sm",
    image: "size-6",
    iconWrap: "size-6",
    icon: "size-4",
  },
  lg: {
    shell: "gap-2 px-4 py-1.5 text-base",
    image: "size-10",
    iconWrap: "size-10",
    icon: "size-6",
  },
  xl: {
    shell: "gap-3 px-5 py-2.5 text-xl leading-snug",
    image: "size-20",
    iconWrap: "size-20",
    icon: "size-12",
  },
} as const;

const categoryTone: Record<WingCategory, string> = {
  milestone: "border-gold/40 bg-gold/15 text-gold-light",
  trust: "border-gold/35 bg-gold/12 text-gold-light",
  community: "border-border bg-surface text-muted-foreground",
};

export function WingBadge({
  title,
  iconLabel,
  imageUrl,
  category = "milestone",
  size = "sm",
  className,
}: WingBadgeProps) {
  const iconType = resolveBadgeIconType(iconLabel);
  const sizes = sizeClasses[size];

  return (
    <span
      title={`${title} · ${getWingCategoryLabel(category)}`}
      className={cn(
        "inline-flex max-w-full items-center rounded-full border font-medium",
        sizes.shell,
        categoryTone[category],
        className,
      )}
    >
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt=""
          className={cn("shrink-0 object-contain", sizes.image)}
        />
      ) : (
        <span
          className={cn(
            "inline-flex shrink-0 items-center justify-center rounded-full bg-background/60 text-current",
            sizes.iconWrap,
          )}
          aria-hidden
        >
          <BadgeWingIcon type={iconType} className={sizes.icon} />
        </span>
      )}
      <span className="min-w-0 break-words">{title}</span>
    </span>
  );
}
