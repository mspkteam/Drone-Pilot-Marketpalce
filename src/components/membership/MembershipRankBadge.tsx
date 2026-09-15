import Image from "next/image";
import {
  getDisplayCodeForTier,
  getRankImageForTierCode,
} from "@/lib/membership/rank-assets";
import { cn } from "@/lib/utils";

type MembershipRankBadgeProps = {
  tierCode: string;
  tierName: string;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
};

const sizeClasses = {
  sm: {
    image: "h-8 w-[1.125rem]",
    code: "text-[10px] leading-none tracking-[0.08em]",
    name: "text-[11px] leading-none tracking-[0.04em]",
    gap: "gap-2",
    padding: "px-2.5 py-1.5",
    textGap: "gap-0.5",
  },
  md: {
    image: "h-11 w-[1.625rem]",
    code: "text-xs leading-none tracking-[0.08em]",
    name: "text-sm leading-none tracking-[0.04em]",
    gap: "gap-3",
    padding: "px-4 py-3",
    textGap: "gap-1",
  },
  lg: {
    image: "h-14 w-[2rem]",
    code: "text-sm leading-none tracking-[0.08em]",
    name: "text-base leading-none tracking-[0.04em]",
    gap: "gap-3",
    padding: "px-5 py-4",
    textGap: "gap-1",
  },
} as const;

export function MembershipRankBadge({
  tierCode,
  tierName,
  size = "md",
  showLabel = true,
  className,
}: MembershipRankBadgeProps) {
  const rankImage = getRankImageForTierCode(tierCode);
  const displayCode = getDisplayCodeForTier(tierCode);
  const styles = sizeClasses[size];

  if (!rankImage) {
    return (
      <span
        className={cn(
          "inline-flex rounded-lg border border-gold/45 bg-gold/15 px-4 py-2 font-mono text-sm font-bold text-gold-light",
          className,
        )}
      >
        {displayCode}
      </span>
    );
  }

  const gradeName = tierName.replace(/^A-\d+\s+/, "");

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-xl border border-[rgba(216,179,57,0.35)] bg-[rgba(216,179,57,0.06)]",
        styles.gap,
        styles.padding,
        className,
      )}
      title={`${displayCode} ${gradeName}`}
    >
      <Image
        src={rankImage}
        alt={`${displayCode} ${gradeName} rank insignia`}
        width={27}
        height={46}
        className={cn("shrink-0 object-contain object-center", styles.image)}
      />
      {showLabel ? (
        <div className={cn("flex min-w-0 flex-col justify-center", styles.textGap)}>
          <p
            className={cn(
              "font-mono font-bold uppercase text-gold",
              styles.code,
            )}
          >
            {displayCode}
          </p>
          <p
            className={cn(
              "font-semibold uppercase text-ras-text",
              styles.name,
            )}
          >
            {gradeName}
          </p>
        </div>
      ) : null}
    </div>
  );
}
