import Link from "next/link";
import { LegalContentInner } from "@/components/marketing/legal/LegalContentInner";
import {
  COOKIE_LAST_UPDATED,
  COOKIE_SECTIONS,
} from "@/lib/marketing/cookie-content";

export function CookieContent() {
  return (
    <section
      className="figma-cookie-section figma-marketing-section"
      aria-label="Cookie policy"
    >
      <LegalContentInner className="space-y-10 sm:space-y-12">
        {COOKIE_SECTIONS.map((section) => (
          <article key={section.title}>
            <h2 className="text-lg font-bold tracking-tight text-ras-text sm:text-xl">
              {section.title}
            </h2>
            <p className="mt-3 text-sm leading-[1.75] text-ras-soft sm:text-base">
              {"contactLink" in section && section.contactLink ? (
                <>
                  Reach our team via the{" "}
                  <Link
                    href="/contact"
                    className="font-medium text-ras-muted underline decoration-[rgba(216,179,57,0.35)] underline-offset-2 transition-colors hover:text-gold"
                  >
                    Contact page
                  </Link>{" "}
                  for privacy questions
                </>
              ) : (
                section.body
              )}
            </p>
          </article>
        ))}
        <p className="mt-14 text-sm text-ras-dim sm:mt-16">
          Last updated: {COOKIE_LAST_UPDATED}
        </p>
      </LegalContentInner>
    </section>
  );
}
