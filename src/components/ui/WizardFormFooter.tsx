"use client";

import { Button } from "@/components/ui/Button";

type WizardFormFooterProps = {
  step: number;
  totalSteps: number;
  onBack: () => void;
  onNext: () => void;
  onSubmit: () => void;
  loading?: boolean;
  submitLabel?: string;
  nextLabel?: string;
};

/**
 * Standard Back / Next / Submit actions for multi-step forms.
 * Primary actions use gold + white text via Button primary variant.
 */
export function WizardFormFooter({
  step,
  totalSteps,
  onBack,
  onNext,
  onSubmit,
  loading = false,
  submitLabel = "Submit",
  nextLabel = "Next",
}: WizardFormFooterProps) {
  const isFirst = step === 0;
  const isLast = step === totalSteps - 1;

  return (
    <>
      <div>
        {!isFirst ? (
          <Button type="button" variant="outline" onClick={onBack} disabled={loading}>
            Back
          </Button>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-2">
        {!isLast ? (
          <Button type="button" onClick={onNext} disabled={loading}>
            {nextLabel}
          </Button>
        ) : (
          <Button type="button" onClick={onSubmit} disabled={loading}>
            {loading ? "Submitting…" : submitLabel}
          </Button>
        )}
      </div>
    </>
  );
}
