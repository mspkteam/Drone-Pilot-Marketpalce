import { PrivacyContent } from "@/components/marketing/privacy/PrivacyContent";
import { PrivacyHero } from "@/components/marketing/privacy/PrivacyHero";

export const metadata = {
  title: "Privacy Policy — Remote Air Service",
  description:
    "Read how Remote Air Service collects, uses, and protects your information on the drone pilot marketplace.",
};

export default function PrivacyPage() {
  return (
    <>
      <PrivacyHero />
      <PrivacyContent />
    </>
  );
}
