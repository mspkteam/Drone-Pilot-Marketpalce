"use client";

import type { AdminCertificateTemplateCardDto } from "@/types/admin-certificates";

type AdminCertificateTemplateCardProps = {
  template: AdminCertificateTemplateCardDto;
  selected: boolean;
  canEdit: boolean;
  onSelect: () => void;
  onPreview: () => void;
  onEdit: () => void;
};

export function AdminCertificateTemplateCard({
  template,
  selected,
  canEdit,
  onSelect,
  onPreview,
  onEdit,
}: AdminCertificateTemplateCardProps) {
  return (
    <article
      className={`admin-certificates-template-card${
        selected ? " admin-certificates-template-card--selected" : ""
      }`}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect();
        }
      }}
      role="button"
      tabIndex={0}
      aria-pressed={selected}
    >
      <div className="admin-certificates-template-thumb">
        {template.backgroundImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={template.backgroundImageUrl}
            alt=""
            className="admin-certificates-template-thumb-img"
          />
        ) : (
          <div className="admin-certificates-template-thumb-fallback">
            <span>{template.previewTitleLines[0] ?? "CERT"}</span>
            <span>{template.previewTitleLines[1] ?? ""}</span>
          </div>
        )}
      </div>
      <div className="admin-certificates-template-body">
        {!template.isActive ? (
          <span className="admin-certificates-template-badge">Reference</span>
        ) : null}
        <h3 className="admin-certificates-template-name">
          {template.name.toUpperCase()}
        </h3>
        <p className="admin-certificates-template-trigger">
          {template.triggerLabel} · {template.issuedCount.toLocaleString()} issued
        </p>
        <p className="admin-certificates-template-desc">
          {template.displayDescription}
        </p>
        <div className="admin-certificates-template-actions">
          <button
            type="button"
            className="admin-certificates-btn-preview"
            onClick={(event) => {
              event.stopPropagation();
              onPreview();
            }}
          >
            PREVIEW
          </button>
          {canEdit ? (
            <button
              type="button"
              className="admin-certificates-btn-edit"
              onClick={(event) => {
                event.stopPropagation();
                onEdit();
              }}
            >
              EDIT
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}
