import { cn } from "@/lib/utils";

type DashboardHeroProps = {
  eyebrow: string;
  title: string;
  description?: string;
  aside?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
};

/** Hero panel — same structure as public pilot profile hero. */
export function DashboardHero({
  eyebrow,
  title,
  description,
  aside,
  footer,
  className,
}: DashboardHeroProps) {
  return (
    <article
      className={cn(
        "premium-panel relative overflow-hidden border-gold/25 p-6 sm:p-8 lg:p-10",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_100%_0%,rgba(201,162,39,0.12),transparent_55%),radial-gradient(ellipse_50%_40%_at_0%_100%,rgba(201,162,39,0.06),transparent_50%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
        aria-hidden
      />

      <div className="relative">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-gold">
              {eyebrow}
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              {title}
            </h1>
            {description ? (
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                {description}
              </p>
            ) : null}
          </div>
          {aside ? <div className="shrink-0">{aside}</div> : null}
        </div>
        {footer ? (
          <div className="relative mt-8 border-t border-border/60 pt-6">
            {footer}
          </div>
        ) : null}
      </div>
    </article>
  );
}
