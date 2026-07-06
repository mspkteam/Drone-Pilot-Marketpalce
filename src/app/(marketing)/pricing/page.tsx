import { PricingComparison } from "@/components/marketing/pricing/PricingComparison";
import { PricingCta } from "@/components/marketing/pricing/PricingCta";
import { PricingFaq } from "@/components/marketing/pricing/PricingFaq";
import { PricingHero } from "@/components/marketing/pricing/PricingHero";
import { PricingMembershipIntro } from "@/components/marketing/pricing/PricingMembershipIntro";
import { PricingPlanCards } from "@/components/marketing/pricing/PricingPlanCards";
import { getPricingPilotContext } from "@/lib/marketing/pricing-pilot-context";

export const metadata = {
  title: "Pricing — Pilot Membership & Fast Forward",
  description:
    "Remote Air Service pilot membership is $99.99/year. Compare one-time Fast Forward grades A-1 through A-6, benefits, and upgrade paths.",
};

export default async function PricingPage() {
  const { currentPlanCode, isPilot } = await getPricingPilotContext();

  return (
    <>
      <PricingHero />
      <PricingMembershipIntro />
      <PricingPlanCards
        currentPlanCode={currentPlanCode}
        isPilot={isPilot}
      />
      <PricingComparison />
      <PricingFaq />
      <PricingCta />
    </>
  );
}
