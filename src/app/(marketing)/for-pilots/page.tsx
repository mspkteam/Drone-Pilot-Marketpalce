import { MarketingPage } from "@/components/layout/MarketingPage";
import { FeatureGrid } from "@/components/marketing/FeatureGrid";
import { MarketingCta } from "@/components/marketing/MarketingCta";
import { MarketingSteps } from "@/components/marketing/MarketingSteps";

export const metadata = {
  title: "For Pilots",
  description: "Find drone missions, submit bids, and grow your aerial services business.",
};

export default function ForPilotsPage() {
  return (
    <MarketingPage
      badge="Pilots"
      title="Grow your drone business"
      description="Get approved, subscribe to a plan, browse open jobs, and win missions from verified clients."
    >
      <div className="space-y-16">
        <FeatureGrid
          features={[
            {
              title: "Curated job board",
              description:
                "Only admin-approved jobs appear — real clients with clear scopes and budgets.",
            },
            {
              title: "Public profile",
              description:
                "Opt into the pilot directory so clients can discover you before jobs are posted.",
            },
            {
              title: "One bid per job",
              description:
                "Submit a professional proposal with your rate and delivery timeline.",
            },
            {
              title: "Booking lifecycle",
              description:
                "From acceptance through completion — status tracking both sides can trust.",
            },
            {
              title: "Reviews & reputation",
              description:
                "Earn ratings after completed missions to stand out on your public profile.",
            },
            {
              title: "Simple subscriptions",
              description:
                "Basic and Pro plans for Phase 1 — scale up as your flight volume grows.",
            },
          ]}
        />

        <section>
          <h2 className="text-lg font-semibold">Pilot journey</h2>
          <div className="mt-6">
            <MarketingSteps
              steps={[
                {
                  title: "Register & onboard",
                  description:
                    "Add license details, services, service area, and compliance checklist.",
                },
                {
                  title: "Profile approval",
                  description:
                    "Admins verify your profile before you can bid on marketplace jobs.",
                },
                {
                  title: "Choose a plan",
                  description: "Subscribe to Basic or Pro to access the job board.",
                },
                {
                  title: "Bid on missions",
                  description:
                    "Submit offers on open jobs that match your credentials and location.",
                },
                {
                  title: "Fly & get paid",
                  description:
                    "Complete bookings, receive payout records, and collect client reviews.",
                },
              ]}
            />
          </div>
        </section>

        <MarketingCta
          title="Start flying paid missions"
          description="Join the marketplace as a pilot — onboarding takes just a few minutes."
          primaryHref="/register"
          primaryLabel="Join as pilot"
          secondaryHref="/pricing"
          secondaryLabel="View pricing"
        />
      </div>
    </MarketingPage>
  );
}
