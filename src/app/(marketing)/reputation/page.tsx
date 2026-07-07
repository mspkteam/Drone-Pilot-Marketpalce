import { ReputationHero } from "@/components/marketing/reputation/ReputationHero";
import { ReputationPillars } from "@/components/marketing/reputation/ReputationPillars";
import { ReputationRankCta } from "@/components/marketing/reputation/ReputationRankCta";
import { MarketingDualPathCta } from "@/components/marketing/figma/MarketingDualPathCta";

export const metadata = {
  title: "Reputation System — Remote Air Service",
  description:
    "Learn how Remote Air Service pilots build trust through reviews, Digital Wings, grade advancement, and verification badges.",
};

export default function ReputationPage() {
  return (
    <div className="figma-reputation-page">
      <ReputationHero />
      <ReputationPillars />
      <ReputationRankCta />
      <MarketingDualPathCta
        title="A Safer Way to Hire Drone Pilots"
        ariaLabel="Hire or apply"
      />
    </div>
  );
}
