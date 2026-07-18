import { CertificateCanvas } from "@/components/admin/certificates/CertificateCanvas";
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
        />
      </div>

      <div className="admin-certificates-verify-strip">
        <div className="admin-certificates-verify-copy">
          <span className="admin-certificates-verify-icon" aria-hidden>
            ▦
          </span>
          <p className="admin-certificates-verify-text">
            Encrypted blockchain verification active.
          </p>
        </div>
        <span className="admin-certificates-verify-status">
          STATUS: AUTHENTICATED
        </span>
      </div>
    </aside>
  );
}
