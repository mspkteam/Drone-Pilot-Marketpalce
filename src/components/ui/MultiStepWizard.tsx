"use client";

import { cn } from "@/lib/utils";

export type WizardStep = {
  id: string;
  title: string;
  description?: string;
};

type MultiStepWizardProps = {
  steps: WizardStep[];
  currentStep: number;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
};

export function MultiStepWizard({
  steps,
  currentStep,
  children,
  footer,
  className,
}: MultiStepWizardProps) {
  return (
    <div className={cn("premium-panel p-6 sm:p-8", className)}>
      <nav aria-label="Form progress" className="mb-8">
        <ol className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          {steps.map((step, index) => {
            const done = index < currentStep;
            const active = index === currentStep;
            return (
              <li
                key={step.id}
                className={cn(
                  "flex flex-1 items-start gap-3 sm:flex-col sm:items-center sm:text-center",
                  index < steps.length - 1 &&
                    "sm:border-r sm:border-border sm:pr-4",
                )}
              >
                <span
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-colors",
                    active &&
                      "border-gold bg-gold text-white shadow-[0_0_16px_rgba(201,162,39,0.35)]",
                    done && "border-gold/60 bg-gold/20 text-gold-light",
                    !active &&
                      !done &&
                      "border-border bg-surface text-muted-foreground",
                  )}
                  aria-current={active ? "step" : undefined}
                >
                  {done ? "✓" : index + 1}
                </span>
                <div className="min-w-0 sm:mt-2">
                  <p
                    className={cn(
                      "text-sm font-medium",
                      active ? "text-gold-light" : "text-foreground",
                    )}
                  >
                    {step.title}
                  </p>
                  {step.description ? (
                    <p className="mt-0.5 hidden text-xs text-muted-foreground sm:block">
                      {step.description}
                    </p>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ol>
        <div className="gold-accent-line mt-6" />
      </nav>

      <div className="min-h-[12rem]">{children}</div>

      {footer ? (
        <div className="mt-8 flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
          {footer}
        </div>
      ) : null}
    </div>
  );
}
