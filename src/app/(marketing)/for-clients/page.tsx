import { ClientBenefits } from "@/components/marketing/for-clients/ClientBenefits";
import { ClientHowItWorks } from "@/components/marketing/for-clients/ClientHowItWorks";
import { ClientPageHero } from "@/components/marketing/for-clients/ClientPageHero";
import { ClientPilotsListing } from "@/components/marketing/for-clients/ClientPilotsListing";
import { ClientSafetyCta } from "@/components/marketing/for-clients/ClientSafetyCta";
import { ClientWhoItsFor } from "@/components/marketing/for-clients/ClientWhoItsFor";
import { MarketingWaitlistSection } from "@/components/marketing/figma/MarketingWaitlistSection";
import { listPublicPilots } from "@/lib/pilot/public";

export const metadata = {
  title: "For Clients — Hire verified drone pilots",
  description:
    "Post drone projects, receive pilot offers, compare profiles, and complete aerial work safely with Remote Air Service.",
};

export default async function ForClientsPage() {
  const pilots = await listPublicPilots();

  return (
    <>
      <ClientPageHero />
      <ClientWhoItsFor />
      <ClientHowItWorks />
      <ClientBenefits />
      <ClientPilotsListing pilots={pilots} />
      <ClientSafetyCta />
      <MarketingWaitlistSection source="for-clients" />
    </>
  );
}
