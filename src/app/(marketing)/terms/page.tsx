import { TermsContent } from "@/components/marketing/terms/TermsContent";
import { TermsHero } from "@/components/marketing/terms/TermsHero";
import "@/styles/terms-marketing.css";

export const metadata = {
  title: "Terms & Conditions | Remote Air Service",
  description:
    "Terms and conditions for using the Remote Air Service drone pilot marketplace.",
};

export default function TermsPage() {
  return (
    <main className="terms-page">
      <TermsHero />
      <TermsContent />
    </main>
  );
}
