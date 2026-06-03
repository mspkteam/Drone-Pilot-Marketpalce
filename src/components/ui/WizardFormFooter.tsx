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
  /** Optional second action on the final step (e.g. save draft before submit). */
  onSaveDraft?: () => void;
  draftLabel?: string;
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
  onSaveDraft,
  draftLabel = "Save draft",
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
          <>
            {onSaveDraft ? (
              <Button
                type="button"
                variant="outline"
                disabled={loading}
                onClick={onSaveDraft}
              >
                {loading ? "Saving…" : draftLabel}
              </Button>
            ) : null}
            <Button type="button" onClick={onSubmit} disabled={loading}>
              {loading ? "Submitting…" : submitLabel}
            </Button>
          </>
        )}
      </div>
    </>
  );
}
