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
  removing?: boolean;
  cardError?: string | null;
  onReplace: () => void;
  onRemove?: () => void;
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

function FileGlyph({ mimeType }: { mimeType: string | null }) {
  const isImage = Boolean(mimeType?.startsWith("image/"));
  return (
    <span className="pilot-verification-attached-glyph" aria-hidden>
      {isImage ? (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.35">
          <rect x="2" y="2.5" width="12" height="11" rx="1.5" />
          <circle cx="5.5" cy="6" r="1.1" />
          <path d="M2.5 11.5l3.2-3.2 2.1 2.1 2.4-2.8 3.3 3.9" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.35">
          <path d="M4 2.5h5.5L12.5 5.5V13.5a.5.5 0 0 1-.5.5H4.5a.5.5 0 0 1-.5-.5V2.5z" />
          <path d="M9.5 2.5V5.5H12.5" />
        </svg>
      )}
    </span>
  );
}

export function PilotVerificationDocumentCardView({
  card,
  uploading,
  removing = false,
  cardError = null,
  onReplace,
  onRemove,
}: PilotVerificationDocumentCardViewProps) {
  const busy = uploading || removing;
  const verification = card.verification;
  const hasAttachment =
    Boolean(verification?.hasUploadedDocument) ||
    Boolean(verification?.documentUrl) ||
    Boolean(verification?.originalFileName) ||
    Boolean(verification?.documentFileName);
  const fileLabel =
    verification?.originalFileName?.trim() ||
    verification?.documentFileName?.trim() ||
    (verification?.documentUrl ? "Linked document" : null);
  const canRemove =
    Boolean(onRemove) &&
    Boolean(verification?.id) &&
    hasAttachment &&
    card.uiStatus !== "approved" &&
    card.uiStatus !== "missing" &&
    card.uiStatus !== "optional";
  const documentHref = verification?.id
    ? `/api/pilot/verifications/${verification.id}/document`
    : null;

  return (
    <article
      className={`pilot-verification-doc-card${
        hasAttachment ? " pilot-verification-doc-card--attached" : ""
      }`}
    >
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

        {hasAttachment && fileLabel ? (
          <div className="pilot-verification-attached" role="status">
            <FileGlyph mimeType={verification?.documentMimeType ?? null} />
            <div className="pilot-verification-attached-copy">
              <p className="pilot-verification-attached-label">File attached</p>
              {documentHref ? (
                <a
                  href={documentHref}
                  target="_blank"
                  rel="noreferrer"
                  className="pilot-verification-attached-name"
                >
                  {fileLabel}
                </a>
              ) : (
                <p className="pilot-verification-attached-name">{fileLabel}</p>
              )}
            </div>
          </div>
        ) : null}

        {card.uiStatus === "rejected" && card.adminNote ? (
          <p className="pilot-verification-doc-admin-note" role="alert">
            <strong>ADMIN:</strong> {card.adminNote}
          </p>
        ) : null}
        {cardError ? (
          <p className="pilot-verification-doc-admin-note" role="alert">
            {cardError}
          </p>
        ) : null}
      </div>

      <div>
        <div className="pilot-verification-doc-actions">
          <button
            type="button"
            className="pilot-verification-doc-upload-btn"
            onClick={onReplace}
            disabled={busy}
          >
            <UploadIcon />
            {uploading
              ? "Uploading…"
              : hasAttachment
                ? "Replace File"
                : "Upload File"}
          </button>
          {canRemove ? (
            <button
              type="button"
              className="pilot-verification-doc-remove-btn"
              onClick={onRemove}
              disabled={busy}
            >
              {removing ? "Removing…" : "Remove"}
            </button>
          ) : null}
        </div>
        <p className="pilot-verification-doc-file-note">
          PDF · JPG · PNG · WEBP · max 5MB
        </p>
      </div>
    </article>
  );
}
