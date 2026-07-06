import Link from "next/link";

/** Gold-band dual CTA — Figma 808:44916 (Final CTA Section). */
type MarketingDualPathCtaProps = {
  title: string;
  ariaLabel: string;
};

export function MarketingDualPathCta({
  title,
  ariaLabel,
}: MarketingDualPathCtaProps) {
  return (
    <section
      className="figma-home-waitlist border-t border-[rgba(77,70,53,0.5)]"
      aria-label={ariaLabel}
    >
      <div className="figma-waitlist-inner public-container">
        <div className="figma-waitlist-stack">
          <h2 className="w-full text-center text-3xl font-extrabold tracking-[-0.02em] text-ras-cta sm:text-[3rem] sm:leading-[1.1]">
            {title}
          </h2>
          <div className="figma-how-it-works-path-cta-actions">
            <Link href="/for-clients" className="figma-path-cta-btn-outline">
              Hire a Pilot
            </Link>
            <Link href="/register?role=pilot" className="figma-path-cta-btn-dark">
              Apply as Pilot
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
