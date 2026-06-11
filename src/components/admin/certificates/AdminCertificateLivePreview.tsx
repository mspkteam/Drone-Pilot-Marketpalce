import type { AdminCertificateTemplateCardDto } from "@/types/admin-certificates";

type AdminCertificateLivePreviewProps = {
  template: AdminCertificateTemplateCardDto;
};

const SAMPLE_VERIFICATION_ID = "#MQ0KSWS7";
const SAMPLE_ISSUED_DATE = "2023-11-24";

export function AdminCertificateLivePreview({
  template,
}: AdminCertificateLivePreviewProps) {
  const [lineOne, lineTwo] = template.previewTitleLines;

  return (
    <aside className="admin-certificates-preview-panel" aria-label="Live preview">
      <div>
        <p className="admin-certificates-preview-label">LIVE PREVIEW</p>
        <p className="admin-certificates-preview-sub">{template.name}</p>
      </div>

      <div className="admin-certificates-preview-canvas-wrap">
        <div className="admin-certificates-preview-canvas">
          <span className="admin-certificates-preview-bracket admin-certificates-preview-bracket--tl" />
          <span className="admin-certificates-preview-bracket admin-certificates-preview-bracket--tr" />
          <span className="admin-certificates-preview-bracket admin-certificates-preview-bracket--bl" />
          <span className="admin-certificates-preview-bracket admin-certificates-preview-bracket--br" />
          <span className="admin-certificates-preview-watermark" aria-hidden>
            ✦
          </span>

          <p className="admin-certificates-preview-brand">REMOTE AIR SERVICE</p>
          <p className="admin-certificates-preview-medal" aria-hidden>
            ★
          </p>
          {lineOne ? <p className="admin-certificates-preview-title">{lineOne}</p> : null}
          {lineTwo ? <p className="admin-certificates-preview-title">{lineTwo}</p> : null}
          <p className="admin-certificates-preview-copy">This certifies that</p>
          <p className="admin-certificates-preview-pilot">[PILOT NAME]</p>
          <p className="admin-certificates-preview-copy">has successfully completed</p>
          <p className="admin-certificates-preview-mission">{template.previewMission}</p>

          <dl className="admin-certificates-preview-meta">
            <div>
              <dt>ISSUED DATE</dt>
              <dd>{SAMPLE_ISSUED_DATE}</dd>
            </div>
            <div>
              <dt>VERIFICATION ID</dt>
              <dd>{SAMPLE_VERIFICATION_ID}</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="admin-certificates-verify-strip">
        <div className="admin-certificates-verify-copy">
          <span className="admin-certificates-verify-icon" aria-hidden>
            ▦
          </span>
          <p className="admin-certificates-verify-text">Encrypted verification active.</p>
        </div>
        <span className="admin-certificates-verify-status">STATUS: AUTHENTICATED</span>
      </div>
    </aside>
  );
}
