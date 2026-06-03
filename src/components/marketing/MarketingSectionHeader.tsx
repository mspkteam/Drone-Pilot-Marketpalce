type MarketingSectionHeaderProps = {
  eyebrow: string;
  title: string;
  description?: string;
};

export function MarketingSectionHeader({
  eyebrow,
  title,
  description,
}: MarketingSectionHeaderProps) {
  return (
    <div className="max-w-2xl">
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
