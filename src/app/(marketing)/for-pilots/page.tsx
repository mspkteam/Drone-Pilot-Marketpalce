import { MarketingPage } from "@/components/layout/MarketingPage";
import { FeatureGrid } from "@/components/marketing/FeatureGrid";
import { MarketingCta } from "@/components/marketing/MarketingCta";
import { MarketingSectionHeader } from "@/components/marketing/MarketingSectionHeader";
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
      <div className="space-y-14 sm:space-y-20">
        <section>
          <MarketingSectionHeader
            eyebrow="Platform benefits"
            title="Built for licensed operators"
            description="Everything you need to find missions, win bids, and manage bookings — without chasing leads on generic job boards."
          />
          <FeatureGrid
            className="mt-8 lg:mt-10"
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
                title: "Membership tiers",
                description:
                  "A-1 through A-6 plans control visibility and bidding — scale as your volume grows.",
              },
            ]}
          />
        </section>

        <section className="premium-panel p-6 sm:p-8 lg:p-10">
          <MarketingSectionHeader
            eyebrow="Your path"
            title="Pilot journey"
            description="From signup to paid missions — a clear, admin-verified workflow."
          />
          <div className="mt-8 lg:mt-10">
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
                  description: "Subscribe to a tier to access the job board and bidding.",
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
