import { CertificateCanvas } from "@/components/admin/certificates/CertificateCanvas";
import type { OverlayFieldOverride } from "@/lib/certificates/layouts";
import type { AdminCertificateTemplateCardDto } from "@/types/admin-certificates";

type AdminCertificateLivePreviewProps = {
  template: AdminCertificateTemplateCardDto;
};

export function AdminCertificateLivePreview({
  template,
}: AdminCertificateLivePreviewProps) {
  return (
    <aside className="admin-certificates-preview-panel" aria-label="Live preview">
      <div className="admin-certificates-preview-head">
        <div>
          <p className="admin-certificates-preview-label">LIVE PREVIEW</p>
          <p className="admin-certificates-preview-sub">{template.name}</p>
        </div>
      </div>

      <div className="admin-certificates-preview-canvas-wrap">
        <CertificateCanvas
          titleLines={template.previewTitleLines}
          mission={template.previewMission}
          backgroundImageUrl={template.backgroundImageUrl}
          layoutKey={template.layoutKey ?? template.slug}
          overlayPositions={
            template.overlayPositions as OverlayFieldOverride[] | null
          }
          gradeOrTitle={template.previewGrade}
          memberName="Jonathan Doe"
          certificateNumber="DPM-2026-000075"
          issuedAt={new Date("2026-01-01")}
        />
      </div>

      <div className="admin-certificates-verify-strip">
        <div className="admin-certificates-verify-copy">
          <span className="admin-certificates-verify-icon" aria-hidden>
            ▦
          </span>
          <p className="admin-certificates-verify-text">
            Official Remote Air Service certificate artwork.
          </p>
        </div>
        <span className="admin-certificates-verify-status">
          STATUS: AUTHENTICATED
        </span>
      </div>
    </aside>
  );
}
