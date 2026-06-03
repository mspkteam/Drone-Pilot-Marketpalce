import { MarketingPage } from "@/components/layout/MarketingPage";
import { PricingPlans } from "@/components/marketing/PricingPlans";
import { MarketingCta } from "@/components/marketing/MarketingCta";

export const metadata = {
  title: "Pricing",
  description: "Pilot subscription plans and client commission overview.",
};

export default function PricingPage() {
  return (
    <MarketingPage
      title="Pricing"
      description="Transparent pilot subscriptions and a 10% platform commission on completed bookings."
    >
      <div className="space-y-12">
        <PricingPlans />
        <MarketingCta
          title="Questions about enterprise or volume?"
          description="Contact us for custom arrangements — we're expanding region by region."
          primaryHref="/contact"
          primaryLabel="Contact us"
        />
      </div>
    </MarketingPage>
  );
}
