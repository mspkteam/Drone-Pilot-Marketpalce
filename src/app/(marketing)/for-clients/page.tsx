import { ClientBenefits } from "@/components/marketing/for-clients/ClientBenefits";
import { ClientHowItWorks } from "@/components/marketing/for-clients/ClientHowItWorks";
import { ClientPageHero } from "@/components/marketing/for-clients/ClientPageHero";
import { ClientSafetyCta } from "@/components/marketing/for-clients/ClientSafetyCta";
import { ClientWhoItsFor } from "@/components/marketing/for-clients/ClientWhoItsFor";
import { MarketingWaitlistSection } from "@/components/marketing/figma/MarketingWaitlistSection";

export const metadata = {
  title: "For Clients — Hire verified drone pilots",
  description:
    "Post drone projects, receive pilot offers, compare profiles, and complete aerial work safely with Remote Air Service.",
};

export default function ForClientsPage() {
  return (
    <div className="figma-for-clients-page">
      <ClientPageHero />
      <ClientWhoItsFor />
      <ClientHowItWorks />
      <ClientBenefits />
      <ClientSafetyCta />
      <MarketingWaitlistSection source="for-clients" roleInterest="client" />
    </div>
  );
}
