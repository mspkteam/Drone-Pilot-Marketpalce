import { TERMS_INTRO, TERMS_LAST_UPDATED } from "@/lib/marketing/terms-content";

export function TermsHero() {
  return (
    <section className="terms-hero">
      <div className="terms-hero-glow" aria-hidden />
      <div className="public-container terms-hero-inner">
        <span className="terms-hero-badge">
          <span className="terms-hero-badge-dot" aria-hidden />
          Legal
        </span>
        <h1 className="terms-hero-title">
          Terms & <span className="terms-hero-title-accent">Conditions</span>
        </h1>
        <div className="terms-hero-intro">
          {TERMS_INTRO.map((parts, index) => (
            <p key={index} className="terms-hero-intro-paragraph">
              {parts.map((part) => part.text).join("")}
            </p>
          ))}
        </div>
        <p className="terms-hero-updated">Last updated: {TERMS_LAST_UPDATED}</p>
      </div>
    </section>
  );
}
