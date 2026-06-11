import { TermsContent } from "@/components/marketing/terms/TermsContent";
import { TermsHero } from "@/components/marketing/terms/TermsHero";

export const metadata = {
  title: "Terms & Conditions — Remote Air Service",
  description:
    "Read the Terms & Conditions for using Remote Air Service, the professional drone pilot marketplace.",
};

export default function TermsPage() {
  return (
    <>
      <TermsHero />
      <TermsContent />
    </>
  );
}
