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
    <div className={cn("premium-panel p-6 sm:p-8 lg:p-10", className)}>
      <nav aria-label="Form progress" className="mb-8">
        <ol className="grid gap-0 sm:flex sm:items-start sm:justify-between">
          {steps.map((step, index) => {
            const done = index < currentStep;
            const active = index === currentStep;
            return (
              <li
                key={step.id}
                className={cn(
                  "relative flex gap-3 py-3 sm:flex-1 sm:flex-col sm:items-center sm:py-0 sm:text-center",
                  index < steps.length - 1 &&
                    "border-b border-border sm:border-b-0 sm:border-r sm:pr-4",
                )}
              >
                <span
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-colors",
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
                <div className="min-w-0 flex-1 sm:mt-2 sm:flex-none">
                  <p
                    className={cn(
                      "text-sm font-medium leading-snug",
                      active ? "text-gold-light" : "text-foreground",
                    )}
                  >
                    {step.title}
                  </p>
                  {step.description ? (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {step.description}
                    </p>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ol>
        <div className="gold-accent-line mt-4 sm:mt-6" />
      </nav>

      <div className="wizard-step-content min-h-[12rem]" key={currentStep}>
        {children}
      </div>

      {footer ? (
        <div className="mt-8 flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
          {footer}
        </div>
      ) : null}
    </div>
  );
}
