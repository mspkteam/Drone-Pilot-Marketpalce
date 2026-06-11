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
    image: "h-9 w-auto",
    code: "text-[10px]",
    name: "text-[11px]",
    gap: "gap-2",
    padding: "px-3 py-2",
  },
  md: {
    image: "h-11 w-auto",
    code: "text-xs",
    name: "text-sm",
    gap: "gap-3",
    padding: "px-4 py-3",
  },
  lg: {
    image: "h-14 w-auto",
    code: "text-sm",
    name: "text-base",
    gap: "gap-3",
    padding: "px-5 py-4",
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
        "flex items-center rounded-xl border border-[rgba(216,179,57,0.35)] bg-[rgba(216,179,57,0.06)]",
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
        className={cn("shrink-0 object-contain", styles.image)}
      />
      {showLabel ? (
        <div className="min-w-0">
          <p
            className={cn(
              "font-mono font-bold uppercase tracking-[0.12em] text-gold",
              styles.code,
            )}
          >
            {displayCode}
          </p>
          <p
            className={cn(
              "mt-0.5 font-semibold uppercase tracking-wide text-ras-text",
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
