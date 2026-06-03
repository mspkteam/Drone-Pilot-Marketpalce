import { cn } from "@/lib/utils";

type Feature = {
  title: string;
  description: string;
};

type FeatureGridProps = {
  features: Feature[];
  className?: string;
};

export function FeatureGrid({ features, className }: FeatureGridProps) {
  return (
    <div
      className={cn(
        "grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6",
        className,
      )}
    >
      {features.map((feature, index) => (
        <article
          key={feature.title}
          className="premium-card group relative overflow-hidden p-6"
        >
          <div
            className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-gold/70 to-transparent opacity-80"
            aria-hidden
          />
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gold/45 bg-gold/15 font-mono text-xs font-semibold text-gold-light">
            {String(index + 1).padStart(2, "0")}
          </span>
          <h3 className="mt-4 font-semibold text-foreground">{feature.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {feature.description}
          </p>
        </article>
      ))}
    </div>
  );
}
