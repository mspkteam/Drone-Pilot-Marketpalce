import { ContactHero } from "@/components/marketing/contact/ContactHero";
import { ContactMessageSection } from "@/components/marketing/contact/ContactMessageSection";
import { ContactPathCta } from "@/components/marketing/contact/ContactPathCta";
import { ContactQuickHelp } from "@/components/marketing/contact/ContactQuickHelp";
import { ContactSupportCards } from "@/components/marketing/contact/ContactSupportCards";

export const metadata = {
  title: "Contact — Remote Air Service",
  description:
    "Contact Remote Air Service for client support, pilot applications, partnerships, and platform questions.",
};

export default function ContactPage() {
  return (
    <>
      <ContactHero />
      <ContactSupportCards />
      <ContactMessageSection />
      <ContactQuickHelp />
      <ContactPathCta />
    </>
  );
}
