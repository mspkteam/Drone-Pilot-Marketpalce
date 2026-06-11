import { cn } from "@/lib/utils";

type MarketingSectionLabelProps = {
  children: string;
  className?: string;
  centered?: boolean;
};

export function MarketingSectionLabel({
  children,
  className,
  centered = false,
}: MarketingSectionLabelProps) {
  return (
    <p
      className={cn(
        "text-xs font-semibold uppercase tracking-[0.2em] text-gold",
        centered && "text-center",
        className,
      )}
    >
      {children}
    </p>
  );
}
