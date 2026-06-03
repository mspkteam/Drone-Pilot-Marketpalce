import { cn } from "@/lib/utils";

type Step = {
  title: string;
  description: string;
};

type MarketingStepsProps = {
  steps: Step[];
  className?: string;
};

export function MarketingSteps({ steps, className }: MarketingStepsProps) {
  return (
    <ol className={cn("grid gap-0 lg:grid-cols-5 lg:gap-4", className)}>
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        return (
          <li
            key={step.title}
            className={cn(
              "relative flex gap-4 py-5 lg:flex-col lg:items-center lg:gap-0 lg:py-0 lg:text-center",
              !isLast &&
                "border-b border-border lg:border-b-0 lg:border-r lg:pr-4",
            )}
          >
            <span
              className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gold/50 bg-gold/20 font-mono text-sm font-semibold text-gold-light shadow-[0_0_20px_rgba(201,162,39,0.15)]"
              aria-hidden
            >
              {String(index + 1).padStart(2, "0")}
            </span>
            <div className="min-w-0 flex-1 lg:mt-4 lg:flex-none">
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
