import { Button } from "@/components/ui/Button";

type MarketingCtaProps = {
  title: string;
  description: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
};

export function MarketingCta({
  title,
  description,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
}: MarketingCtaProps) {
  return (
    <section className="rounded-lg border border-gold/30 bg-gold/10 px-6 py-10 text-center sm:px-10">
      <h2 className="text-xl font-semibold sm:text-2xl">{title}</h2>
      <p className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground sm:text-base">
        {description}
      </p>
      <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
        <Button href={primaryHref}>{primaryLabel}</Button>
        {secondaryHref && secondaryLabel ? (
          <Button href={secondaryHref} variant="outline">
            {secondaryLabel}
          </Button>
        ) : null}
      </div>
    </section>
  );
}
