import Link from "next/link";
import { MarketingPage } from "@/components/layout/MarketingPage";
import { MarketingSteps } from "@/components/marketing/MarketingSteps";
import { MarketingCta } from "@/components/marketing/MarketingCta";

export const metadata = {
  title: "How It Works",
  description: "How clients and pilots work together on Drone Pilot Marketplace.",
};

export default function HowItWorksPage() {
  return (
    <MarketingPage
      title="How it works"
      description="A clear path from job posting to pilot selection, mission delivery, payment, and reviews."
    >
      <div className="space-y-16">
        <section className="grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="text-lg font-semibold text-gold-dark">For clients</h2>
            <div className="mt-6">
              <MarketingSteps
                steps={[
                  {
                    title: "Sign up & post",
                    description: "Create a client account and describe your aerial mission.",
                  },
                  {
                    title: "Admin approval",
                    description: "Jobs are reviewed before going live for pilots.",
                  },
                  {
                    title: "Review bids",
                    description: "Compare pilot offers and accept the best fit.",
                  },
                  {
                    title: "Manage booking",
                    description: "Confirm, track progress, and mark complete when done.",
                  },
                  {
                    title: "Pay & review",
                    description:
                      "Commission is calculated on completion; leave a rating for the pilot.",
                  },
                ]}
              />
            </div>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gold-dark">For pilots</h2>
            <div className="mt-6">
              <MarketingSteps
                steps={[
                  {
                    title: "Onboard & subscribe",
                    description: "Complete profile, pass approval, pick a plan.",
                  },
                  {
                    title: "Browse open jobs",
                    description: "Find approved missions in your service area.",
                  },
                  {
                    title: "Submit your bid",
                    description: "Propose rate, message, and delivery date.",
                  },
                  {
                    title: "Execute mission",
                    description: "Update booking status as work progresses.",
                  },
                  {
                    title: "Get reviewed",
                    description: "Build your public rating after successful flights.",
                  },
                ]}
              />
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-border bg-surface-elevated p-6">
          <h2 className="font-semibold">Trust & safety</h2>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>· Pilot profiles require admin approval before bidding</li>
            <li>· Jobs require admin approval before pilots can see them</li>
            <li>· One accepted bid per job — clear assignment, no confusion</li>
            <li>· Reviews only after completed bookings</li>
          </ul>
          <p className="mt-4 text-sm">
            <Link href="/pilots" className="text-gold-dark hover:text-gold">
              Browse approved pilots →
            </Link>
          </p>
        </section>

        <MarketingCta
          title="See it in action"
          description="Create an account and explore the dashboards built for Phase 1 MVP."
          primaryHref="/register"
          primaryLabel="Create account"
          secondaryHref="/pricing"
          secondaryLabel="Pricing"
        />
      </div>
    </MarketingPage>
  );
}
