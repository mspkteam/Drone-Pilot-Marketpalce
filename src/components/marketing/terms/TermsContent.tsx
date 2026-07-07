import Link from "next/link";
import { LegalContentInner } from "@/components/marketing/legal/LegalContentInner";
import { TermsLegalBody } from "@/components/marketing/terms/TermsLegalBody";
import {
  TERMS_CLOSING,
  TERMS_CONTACT,
  TERMS_INTRO,
} from "@/lib/marketing/terms-content";

export function TermsContent() {
  return (
    <section
      className="figma-terms-section figma-marketing-section"
      aria-label="Terms and conditions"
    >
      <LegalContentInner>
        <div className="terms-intro">
          {TERMS_INTRO.map((parts, index) => (
            <p key={index} className="terms-legal-paragraph">
              {parts.map((part) => part.text).join("")}
            </p>
          ))}
        </div>
        <TermsLegalBody className="mt-10 sm:mt-12" />
        <article className="terms-legal-section">
          <h2 className="terms-legal-heading">CONTACT INFORMATION</h2>
          <div className="terms-legal-section-body">
            <p className="terms-legal-paragraph">{TERMS_CONTACT.company}</p>
            <p className="terms-legal-paragraph">
              Email:{" "}
              <a
                href={`mailto:${TERMS_CONTACT.email}`}
                className="terms-legal-link"
              >
                {TERMS_CONTACT.email}
              </a>
            </p>
            <p className="terms-legal-paragraph">
              Website:{" "}
              <Link href="/" className="terms-legal-link">
                {TERMS_CONTACT.website}
              </Link>
            </p>
            <p className="terms-legal-paragraph">
              Business Address: {TERMS_CONTACT.address}
            </p>
            <p className="terms-legal-paragraph">{TERMS_CLOSING}</p>
          </div>
        </article>
        <div className="terms-content-actions">
          <Link href="/" className="ras-btn-primary terms-back-home">
            Back Home
          </Link>
        </div>
      </LegalContentInner>
    </section>
  );
}
