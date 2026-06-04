import { cn } from "@/lib/utils";

type Step = {
  title: string;
  description: string;
};

type MarketingStepsProps = {
  steps: Step[];
  className?: string;
  /** Horizontal timeline for full-width sections; vertical stack for panels and narrow columns. */
  variant?: "horizontal" | "vertical";
};

export function MarketingSteps({
  steps,
  className,
  variant = "horizontal",
}: MarketingStepsProps) {
  if (variant === "vertical") {
    return (
      <ol className={cn("relative space-y-0", className)}>
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1;
          return (
            <li
              key={step.title}
              className={cn("relative flex gap-4", !isLast && "pb-8")}
            >
              {!isLast ? (
                <span
                  className="absolute left-[21px] top-11 bottom-0 w-px bg-gradient-to-b from-gold/40 to-border"
                  aria-hidden
                />
              ) : null}
              <span
                className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gold/50 bg-gold/20 font-mono text-sm font-semibold text-gold-light shadow-[0_0_20px_rgba(201,162,39,0.15)]"
                aria-hidden
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0 flex-1 pt-1">
                <h3 className="font-semibold text-foreground">{step.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    );
  }

  return (
    <ol
      className={cn(
        "grid gap-0 sm:grid-cols-2 lg:grid-cols-[repeat(auto-fit,minmax(9.5rem,1fr))]",
        className,
      )}
    >
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        return (
          <li
            key={step.title}
            className={cn(
              "relative flex gap-4 py-5 sm:flex-col sm:items-start sm:gap-0 sm:py-0 lg:items-center lg:text-center",
              !isLast &&
                "border-b border-border sm:border-b-0 sm:border-r sm:pr-4 lg:pr-5",
            )}
          >
            <span
              className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gold/50 bg-gold/20 font-mono text-sm font-semibold text-gold-light shadow-[0_0_20px_rgba(201,162,39,0.15)]"
              aria-hidden
            >
              {String(index + 1).padStart(2, "0")}
            </span>
            <div className="min-w-0 flex-1 sm:mt-4 lg:mt-4 lg:flex-none">
              <h3 className="font-semibold text-foreground">{step.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
