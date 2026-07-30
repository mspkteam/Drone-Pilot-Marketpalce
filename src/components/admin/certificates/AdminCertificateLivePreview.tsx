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
          <p className="admin-certificates-preview-label">ISSUED PREVIEW</p>
          <p className="admin-certificates-preview-sub">{template.name}</p>
        </div>
      </div>

      <div className="admin-certificates-preview-canvas-wrap">
        <CertificateCanvas
          backgroundImageUrl={template.backgroundImageUrl}
          layoutKey={template.layoutKey ?? template.slug}
          overlayPositions={
            template.overlayPositions as OverlayFieldOverride[] | null
          }
          gradeOrTitle={template.previewGrade}
          memberName="Jonathan Doe"
          memberNumber="001000"
          certificateNumber="DPM-2026-000001"
          issuedAt={new Date("2026-01-01")}
        />
      </div>

      <p className="admin-cert-builder-hint">
        Same layout and fonts as the PDF pilots download.
      </p>
    </aside>
  );
}
