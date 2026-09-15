import { CertificateCanvas } from "@/components/admin/certificates/CertificateCanvas";
import type { OverlayFieldOverride } from "@/lib/certificates/layouts";
import type { AdminCertificateTemplateCardDto } from "@/types/admin-certificates";

type AdminCertificateLivePreviewProps = {
  template: AdminCertificateTemplateCardDto;
};

/** Sample values that match what pilots see after issue. */
function previewPropsForTemplate(template: AdminCertificateTemplateCardDto) {
  const needsGrade =
    template.manualIssueFields?.includes("gradeOrTitle") ||
    Boolean(template.previewGrade) ||
    template.requiresGrade;
  return {
    memberName: "Jonathan Doe",
    memberNumber: "001000",
    gradeOrTitle: needsGrade
      ? template.previewGrade || "First Officer"
      : template.previewGrade || undefined,
    certificateNumber: "DPM-2026-000001",
    issuedAt: new Date("2026-07-27"),
  };
}

export function AdminCertificateLivePreview({
  template,
}: AdminCertificateLivePreviewProps) {
  const sample = previewPropsForTemplate(template);

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
          {...sample}
        />
      </div>

      <p className="admin-cert-builder-hint">
        Same layout and fonts as the PDF pilots download.
      </p>
    </aside>
  );
}
