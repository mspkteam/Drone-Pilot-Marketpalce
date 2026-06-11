import { MarketingWaitlistSection } from "@/components/marketing/figma/MarketingWaitlistSection";
import { PilotMembershipPreview } from "@/components/marketing/for-pilots/PilotMembershipPreview";
import { PilotOnboarding } from "@/components/marketing/for-pilots/PilotOnboarding";
import { PilotPageHero } from "@/components/marketing/for-pilots/PilotPageHero";
import { PilotProfileSection } from "@/components/marketing/for-pilots/PilotProfileSection";
import { PilotReputationCta } from "@/components/marketing/for-pilots/PilotReputationCta";
import { PilotWhyJoin } from "@/components/marketing/for-pilots/PilotWhyJoin";

export const metadata = {
  title: "For Pilots — Grow your drone pilot career",
  description:
    "Join Remote Air Service to access project leads, build reputation, choose membership tiers, and grow your professional drone pilot career.",
};

export default function ForPilotsPage() {
  return (
    <>
      <PilotPageHero />
      <PilotWhyJoin />
      <PilotOnboarding />
      <PilotProfileSection />
      <PilotMembershipPreview />
      <PilotReputationCta />
      <MarketingWaitlistSection source="for-pilots" roleInterest="pilot" />
    </>
  );
}
