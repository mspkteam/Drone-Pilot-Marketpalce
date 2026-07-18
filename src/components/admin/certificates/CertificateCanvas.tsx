type CertificateCanvasProps = {
  titleLines: string[];
  mission: string;
  memberName?: string;
  issuedDate?: string;
  verificationId?: string;
};

/**
 * Pixel-faithful Remote Air Service certificate card (Figma 808:37752).
 * Shared by the page live preview and the certificate builder preview.
 */
export function CertificateCanvas({
  titleLines,
  mission,
  memberName = "[MEMBER NAME]",
  issuedDate = "2023-11-24",
  verificationId = "#MQ0KSWS7",
}: CertificateCanvasProps) {
  const [lineOne, lineTwo] = titleLines;

  return (
    <div className="cert-canvas">
      <span className="cert-canvas-bracket cert-canvas-bracket--tl" aria-hidden />
      <span className="cert-canvas-bracket cert-canvas-bracket--tr" aria-hidden />
      <span className="cert-canvas-bracket cert-canvas-bracket--bl" aria-hidden />
      <span className="cert-canvas-bracket cert-canvas-bracket--br" aria-hidden />

      <span className="cert-canvas-watermark" aria-hidden>
        <svg viewBox="0 0 24 24" width="200" height="200" fill="none" aria-hidden>
          <path
            d="M12 3.5l2.2 4.5 5 .7-3.6 3.5.9 5.1L12 15.4 7.5 17.3l.9-5.1L4.8 8.7l5-.7L12 3.5z"
            stroke="currentColor"
            strokeWidth="0.8"
            strokeLinejoin="round"
          />
        </svg>
      </span>

      <div className="cert-canvas-frame">
        <span className="cert-canvas-medal" aria-hidden>
          <svg viewBox="0 0 24 24" width="30" height="30" fill="none" aria-hidden>
            <path
              d="M12 3.5l2.2 4.5 5 .7-3.6 3.5.9 5.1L12 15.4 7.5 17.3l.9-5.1L4.8 8.7l5-.7L12 3.5z"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinejoin="round"
              fill="currentColor"
              fillOpacity="0.2"
            />
          </svg>
        </span>

        <p className="cert-canvas-brand">REMOTE AIR SERVICE</p>

        <div className="cert-canvas-title">
          {lineOne ? <span>{lineOne}</span> : null}
          {lineTwo ? <span>{lineTwo}</span> : null}
        </div>

        <p className="cert-canvas-copy cert-canvas-copy--italic">
          This certifies that
        </p>
        <p className="cert-canvas-member">{memberName}</p>
        <p className="cert-canvas-copy">has successfully completed</p>
        <p className="cert-canvas-mission">{mission}</p>

        <dl className="cert-canvas-meta">
          <div className="cert-canvas-meta-item">
            <dt>ISSUED DATE</dt>
            <dd>{issuedDate}</dd>
          </div>
          <div className="cert-canvas-meta-item cert-canvas-meta-item--right">
            <dt>VERIFICATION ID</dt>
            <dd>{verificationId}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
