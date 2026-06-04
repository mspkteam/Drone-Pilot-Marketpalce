import { MarketingPage } from "@/components/layout/MarketingPage";
import { FeatureGrid } from "@/components/marketing/FeatureGrid";
import { MarketingCta } from "@/components/marketing/MarketingCta";
import { MarketingSectionHeader } from "@/components/marketing/MarketingSectionHeader";
import { MarketingSteps } from "@/components/marketing/MarketingSteps";

export const metadata = {
  title: "For Clients",
  description: "Post drone jobs, review pilot offers, and manage bookings on one platform.",
};

export default function ForClientsPage() {
  return (
    <MarketingPage
      badge="Clients"
      title="Hire licensed drone pilots"
      description="Post missions, compare bids, and run aerial projects with admin-approved jobs and transparent booking workflows."
    >
      <div className="space-y-14 sm:space-y-20">
        <section>
          <MarketingSectionHeader
            eyebrow="Why us"
            title="Professional aerial hiring"
            description="Skip generic gig boards — get admin-reviewed jobs, verified pilots, and booking tools built for real missions."
          />
          <FeatureGrid
            className="mt-8 lg:mt-10"
            features={[
              {
                title: "Admin-approved jobs",
                description:
                  "Every job is reviewed before pilots can bid, keeping quality high and spam low.",
              },
              {
                title: "Compare pilot offers",
                description:
                  "Review proposals side by side — rates, timelines, and cover messages from verified pilots.",
              },
              {
                title: "End-to-end bookings",
                description:
                  "Accept a pilot, track mission status, pay on completion, and leave reviews.",
              },
              {
                title: "Transparent fees",
                description:
                  "A clear platform commission on completed work — no hidden charges at checkout.",
              },
              {
                title: "Pilot directory",
                description:
                  "Browse public pilot profiles with ratings before you even post a job.",
              },
              {
                title: "Built for professionals",
                description:
                  "Real estate, surveying, inspections, events, and more — one aviation-grade workflow.",
              },
            ]}
          />
        </section>

        <section className="premium-panel p-6 sm:p-8 lg:p-10">
          <MarketingSectionHeader
            eyebrow="Your path"
            title="Client workflow"
            description="From account setup to pilot review — five clear steps on your dashboard."
          />
          <div className="mt-8 lg:mt-10">
            <MarketingSteps
              variant="vertical"
              steps={[
                {
                  title: "Create your client account",
                  description:
                    "Register, complete onboarding, and set up your company profile.",
                },
                {
                  title: "Post a job",
                  description:
                    "Describe the mission, location, budget, and requirements.",
                },
                {
                  title: "Wait for approval",
                  description:
                    "Our team approves jobs so pilots only see legitimate opportunities.",
                },
                {
                  title: "Review offers & hire",
                  description:
                    "Accept the best pilot bid — a booking is created automatically.",
                },
                {
                  title: "Complete & review",
                  description:
                    "Mark the mission complete and rate your pilot to help the community.",
                },
              ]}
            />
          </div>
        </section>

        <MarketingCta
          title="Ready to post your first job?"
          description="Create a free client account and submit your first mission for approval."
          primaryHref="/register"
          primaryLabel="Get started"
          secondaryHref="/pilots"
          secondaryLabel="Browse pilots"
        />
      </div>
    </MarketingPage>
  );
}
