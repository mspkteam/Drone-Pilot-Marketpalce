import Link from "next/link";
import { LegalContentInner } from "@/components/marketing/legal/LegalContentInner";
import { TermsLegalBody } from "@/components/marketing/terms/TermsLegalBody";

export function TermsContent() {
  return (
    <section className="terms-content" aria-label="Terms and conditions">
      <LegalContentInner>
        <TermsLegalBody />
        <div className="terms-content-actions">
          <Link href="/" className="ras-btn-primary terms-back-home">
            Back Home
          </Link>
        </div>
      </LegalContentInner>
    </section>
  );
}
