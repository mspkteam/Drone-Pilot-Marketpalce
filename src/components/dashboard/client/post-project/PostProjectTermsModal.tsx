"use client";

import { PostProjectTermsAcknowledgment } from "@/components/dashboard/client/post-project/PostProjectTermsAcknowledgment";
import { TermsLegalBody } from "@/components/marketing/terms/TermsLegalBody";
import { TERMS_EFFECTIVE_DATE, TERMS_INTRO } from "@/lib/marketing/terms-content";

type PostProjectTermsModalProps = {
  open: boolean;
  acknowledged: boolean;
  loading: boolean;
  onAcknowledgedChange: (acknowledged: boolean) => void;
  onCancel: () => void;
  onSubmit: () => void;
};

export function PostProjectTermsModal({
  open,
  acknowledged,
  loading,
  onAcknowledgedChange,
  onCancel,
  onSubmit,
}: PostProjectTermsModalProps) {
  if (!open) return null;

  return (
    <div
      className="client-post-project-terms-modal-backdrop"
      role="presentation"
      onClick={onCancel}
    >
      <div
        className="client-post-project-terms-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="post-project-terms-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="client-post-project-terms-modal-header">
          <div className="client-post-project-terms-modal-title-row">
            <span className="client-post-project-terms-modal-icon" aria-hidden>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M5 2.5h7.5L15 5v11.25A1.25 1.25 0 0 1 13.75 17.5H5A1.25 1.25 0 0 1 3.75 16.25V3.75A1.25 1.25 0 0 1 5 2.5Z"
                  stroke="currentColor"
                  strokeWidth="1.25"
                />
                <path d="M7.5 2.5V5H12.5" stroke="currentColor" strokeWidth="1.25" />
                <path d="M6.25 10h7.5M6.25 12.5h5" stroke="currentColor" strokeWidth="1.25" />
              </svg>
            </span>
            <h2 id="post-project-terms-title" className="client-post-project-terms-modal-title">
              Terms and Conditions of Use
            </h2>
          </div>
          <p className="client-post-project-terms-modal-date">
            Effective Date: {TERMS_EFFECTIVE_DATE}
          </p>
        </header>

        <div className="client-post-project-terms-modal-body">
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

        <footer className="client-post-project-terms-modal-actions">
          <button
            type="button"
            className="client-post-project-btn-secondary"
            disabled={loading}
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            className="client-post-project-btn-primary"
            disabled={loading || !acknowledged}
            onClick={onSubmit}
          >
            {loading ? "Submitting…" : "Submit Project"}
          </button>
        </footer>
      </div>
    </div>
  );
}
