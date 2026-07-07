import { MarketingDualPathCta } from "@/components/marketing/figma/MarketingDualPathCta";
import { PilotMembershipPreview } from "@/components/marketing/for-pilots/PilotMembershipPreview";
import { PilotOnboarding } from "@/components/marketing/for-pilots/PilotOnboarding";
import { PilotPageHero } from "@/components/marketing/for-pilots/PilotPageHero";
import { PilotProfileSection } from "@/components/marketing/for-pilots/PilotProfileSection";
import { PilotWhyJoin } from "@/components/marketing/for-pilots/PilotWhyJoin";

export const metadata = {
  title: "For Pilots — Grow your drone pilot career",
  description:
    "Join Remote Air Service to access project leads, build reputation, choose membership tiers, and grow your professional drone pilot career.",
};

export default function ForPilotsPage() {
  return (
    <div className="figma-for-pilots-page">
      <PilotPageHero />
      <PilotWhyJoin />
      <PilotOnboarding />
      <PilotProfileSection />
      <PilotMembershipPreview />
      <MarketingDualPathCta
        title="Join the Professional Pilot Network"
        ariaLabel="Hire or apply"
      />
    </div>
  );
}
