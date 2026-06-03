import { cn } from "@/lib/utils";

type MarketingHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
  children?: React.ReactNode;
  className?: string;
};

export function MarketingHero({
  eyebrow,
  title,
  description,
  children,
  className,
}: MarketingHeroProps) {
  return (
    <section className={cn("marketing-hero", className)}>
      <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28 lg:py-32">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-gold">
          {eyebrow}
        </p>
        <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
          {title}
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-neutral-400">{description}</p>
        {children ? (
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            {children}
          </div>
        ) : null}
      </div>
    </section>
  );
}
