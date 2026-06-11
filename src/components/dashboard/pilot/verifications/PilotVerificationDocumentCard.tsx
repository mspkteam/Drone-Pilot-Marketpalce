"use client";

import type { PilotVerificationDocumentCard } from "@/lib/pilot/verification-documents-catalog";

const STATUS_LABEL: Record<PilotVerificationDocumentCard["uiStatus"], string> = {
  approved: "APPROVED",
  pending: "PENDING REVIEW",
  rejected: "REJECTED",
  missing: "MISSING",
  optional: "OPTIONAL",
};

type PilotVerificationDocumentCardViewProps = {
  card: PilotVerificationDocumentCard;
  uploading: boolean;
  onReplace: () => void;
};

function StatusIcon({ status }: { status: PilotVerificationDocumentCard["uiStatus"] }) {
  const className = `pilot-verification-doc-icon pilot-verification-doc-icon--${status}`;
  switch (status) {
    case "approved":
      return (
        <span className={className} aria-hidden>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="9" cy="9" r="7" />
            <path d="M5.5 9.25l2.25 2.25 4.75-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      );
    case "pending":
      return (
        <span className={className} aria-hidden>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="9" cy="9" r="7" />
            <path d="M9 5.5V9l2.5 1.5" strokeLinecap="round" />
          </svg>
        </span>
      );
    case "rejected":
      return (
        <span className={className} aria-hidden>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="9" cy="9" r="7" />
            <path d="M6.25 6.25l5.5 5.5M11.75 6.25l-5.5 5.5" strokeLinecap="round" />
          </svg>
        </span>
      );
    case "missing":
      return (
        <span className={className} aria-hidden>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M9 3.5l6.5 11H2.5L9 3.5z" strokeLinejoin="round" />
            <path d="M9 7.5v3.25M9 12.75h.007" strokeLinecap="round" />
          </svg>
        </span>
      );
    default:
      return (
        <span className={className} aria-hidden>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M9 2.5v9M6 11.5h6M4.5 14.5h9" strokeLinecap="round" />
            <path d="M7 5.5h4l1 2H6l1-2z" strokeLinejoin="round" />
          </svg>
        </span>
      );
  }
}

function UploadIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.35" aria-hidden>
      <path d="M7 9.5V2.5M4.5 5 7 2.5 9.5 5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2.5 11.5h9" strokeLinecap="round" />
    </svg>
  );
}

export function PilotVerificationDocumentCardView({
  card,
  uploading,
  onReplace,
}: PilotVerificationDocumentCardViewProps) {
  return (
    <article className="pilot-verification-doc-card">
      <div>
        <div className="pilot-verification-doc-top">
          <StatusIcon status={card.uiStatus} />
          <span
            className={`pilot-verification-doc-badge pilot-verification-doc-badge--${card.uiStatus}`}
          >
            {STATUS_LABEL[card.uiStatus]}
          </span>
        </div>

        <h3 className="pilot-verification-doc-title">{card.title}</h3>
        <p className="pilot-verification-doc-desc">{card.description}</p>

        {card.uiStatus === "rejected" && card.adminNote ? (
          <p className="pilot-verification-doc-admin-note" role="alert">
            <strong>ADMIN:</strong> {card.adminNote}
          </p>
        ) : null}
      </div>

      <div>
        <button
          type="button"
          className="pilot-verification-doc-upload-btn"
          onClick={onReplace}
          disabled={uploading}
        >
          <UploadIcon />
          {uploading ? "Uploading…" : "Replace File"}
        </button>
        <p className="pilot-verification-doc-file-note">PDF · JPG · PNG · max 10MB</p>
      </div>
    </article>
  );
}
