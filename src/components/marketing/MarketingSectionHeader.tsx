import { cn } from "@/lib/utils";

type MarketingSectionHeaderProps = {
  eyebrow: string;
  title: string;
  description?: string;
  className?: string;
};

export function MarketingSectionHeader({
  eyebrow,
  title,
  description,
  className,
}: MarketingSectionHeaderProps) {
  return (
    <div className={cn("max-w-2xl", className)}>
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-gold">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-3 text-sm text-muted-foreground sm:text-base">
          {description}
        </p>
      ) : null}
    </div>
  );
}
