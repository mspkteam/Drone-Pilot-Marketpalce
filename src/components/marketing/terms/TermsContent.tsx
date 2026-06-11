import Link from "next/link";
import { LegalContentInner } from "@/components/marketing/legal/LegalContentInner";
import {
  TERMS_LAST_UPDATED,
  TERMS_SECTIONS,
} from "@/lib/marketing/terms-content";

export function TermsContent() {
  return (
    <section
      className="figma-terms-section figma-marketing-section"
      aria-label="Terms and conditions"
    >
      <LegalContentInner className="space-y-10 sm:space-y-12">
          {TERMS_SECTIONS.map((section) => (
            <article key={section.title}>
              <h2 className="text-lg font-bold tracking-tight text-ras-text sm:text-xl">
                {section.title}
              </h2>
              <p className="mt-3 text-sm leading-[1.75] text-ras-soft sm:text-base">
                {"contactLink" in section && section.contactLink ? (
                  <>
                    Questions? Reach our team via the{" "}
                    <Link
                      href="/contact"
                      className="font-medium text-ras-muted underline decoration-[rgba(216,179,57,0.35)] underline-offset-2 transition-colors hover:text-gold"
                    >
                      Contact page
                    </Link>
                    .
                  </>
                ) : (
                  section.body
                )}
              </p>
            </article>
          ))}
          <p className="mt-14 text-sm text-ras-dim sm:mt-16">
            Last updated: {TERMS_LAST_UPDATED}
          </p>
      </LegalContentInner>
    </section>
  );
}
