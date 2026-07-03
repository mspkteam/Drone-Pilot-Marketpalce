import Link from "next/link";

export function HowItWorksPathCta() {
  return (
    <section
      className="figma-how-it-works-path-cta"
      aria-label="Choose your path"
    >
      <div className="figma-how-it-works-path-cta-inner public-container">
        <h2 className="figma-how-it-works-path-cta-title">Choose Your Path</h2>
        <div className="figma-how-it-works-path-cta-actions">
          <Link href="/register?role=pilot" className="figma-path-cta-btn-dark">
            Apply as Pilot
          </Link>
          <Link href="/pricing" className="figma-path-cta-btn-outline">
            View Pilot Plans
          </Link>
        </div>
      </div>
    </section>
  );
}
