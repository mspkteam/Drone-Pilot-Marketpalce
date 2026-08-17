"use client";

import { PostProjectTermsAcknowledgment } from "@/components/dashboard/client/post-project/PostProjectTermsAcknowledgment";
import { TermsLegalBody } from "@/components/marketing/terms/TermsLegalBody";
import { TERMS_EFFECTIVE_DATE, TERMS_INTRO } from "@/lib/marketing/terms-content";

type PilotProposalTermsModalProps = {
  open: boolean;
  acknowledged: boolean;
  loading: boolean;
  onAcknowledgedChange: (acknowledged: boolean) => void;
  onCancel: () => void;
  onSubmit: () => void;
};

export function PilotProposalTermsModal({
  open,
  acknowledged,
  loading,
  onAcknowledgedChange,
  onCancel,
  onSubmit,
}: PilotProposalTermsModalProps) {
  if (!open) return null;

  return (
    <div
      className="pilot-submit-terms-backdrop"
      role="presentation"
      onClick={onCancel}
    >
      <div
        className="pilot-submit-terms-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pilot-proposal-terms-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="pilot-submit-terms-header">
          <h2 id="pilot-proposal-terms-title">Terms and Conditions of Use</h2>
          <p>Effective Date: {TERMS_EFFECTIVE_DATE}</p>
        </header>

        <div className="pilot-submit-terms-body">
          {TERMS_INTRO.map((parts, index) => (
            <p key={index}>{parts.map((part) => part.text).join("")}</p>
          ))}
          <TermsLegalBody headingLevel="h3" />
        </div>

        <PostProjectTermsAcknowledgment
          variant="modal"
          acknowledged={acknowledged}
          onAcknowledgedChange={onAcknowledgedChange}
        />

        <footer className="pilot-submit-terms-actions">
          <button type="button" disabled={loading} onClick={onCancel}>
            Cancel
          </button>
          <button
            type="button"
            className="pilot-submit-terms-confirm"
            disabled={loading || !acknowledged}
            onClick={onSubmit}
          >
            {loading ? "Submitting…" : "Confirm & Submit"}
          </button>
        </footer>
      </div>
    </div>
  );
}
