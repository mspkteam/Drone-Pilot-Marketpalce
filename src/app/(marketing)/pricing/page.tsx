import { PricingComparison } from "@/components/marketing/pricing/PricingComparison";
import { PricingCta } from "@/components/marketing/pricing/PricingCta";
import { PricingFaq } from "@/components/marketing/pricing/PricingFaq";
import { PricingHero } from "@/components/marketing/pricing/PricingHero";
import { PricingPlanCards } from "@/components/marketing/pricing/PricingPlanCards";
import { getPricingPilotContext } from "@/lib/marketing/pricing-pilot-context";

export const metadata = {
  title: "Pricing — Pilot Membership Plans",
  description:
    "Compare A-1 through A-6 pilot membership tiers, monthly pricing, benefits, and plan features on Remote Air Service.",
};

export default async function PricingPage() {
  const { currentPlanCode, isPilot } = await getPricingPilotContext();

  return (
    <>
      <PricingHero />
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
