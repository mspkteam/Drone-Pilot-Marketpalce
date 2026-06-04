import Link from "next/link";
import { MarketingPage } from "@/components/layout/MarketingPage";
import { FeatureGrid } from "@/components/marketing/FeatureGrid";
import { MarketingCta } from "@/components/marketing/MarketingCta";
import { MarketingPathCard } from "@/components/marketing/MarketingPathCard";
import { MarketingSectionHeader } from "@/components/marketing/MarketingSectionHeader";
import { MarketingSteps } from "@/components/marketing/MarketingSteps";
import { Button } from "@/components/ui/Button";

export const metadata = {
  title: "How It Works",
  description: "How clients and pilots work together on Drone Pilot Marketplace.",
};

const CLIENT_STEPS = [
  {
    title: "Sign up & post",
    description:
      "Create a client account, complete onboarding, and describe your aerial mission with location and budget.",
  },
  {
    title: "Admin approval",
    description:
      "Our team reviews every job before it goes live so pilots only see legitimate opportunities.",
  },
  {
    title: "Review bids",
    description:
      "Compare pilot proposals — rates, timelines, and messages — then accept the best fit.",
  },
  {
    title: "Manage booking",
    description:
      "Track mission status from confirmation through in-progress to completion on both dashboards.",
  },
  {
    title: "Pay & review",
    description:
      "Platform commission is recorded on completion; rate your pilot to strengthen the community.",
  },
];

const PILOT_STEPS = [
  {
    title: "Onboard & subscribe",
    description:
      "Register, add license and service details, pass profile approval, and choose a membership tier.",
  },
  {
    title: "Browse open jobs",
    description:
      "Find admin-approved missions that match your credentials, tier visibility, and service area.",
  },
  {
    title: "Submit your bid",
    description:
      "Propose your rate, delivery date, and cover message — one clear offer per job.",
  },
  {
    title: "Execute mission",
    description:
      "Update booking status as work progresses so the client always knows where things stand.",
  },
  {
    title: "Get reviewed",
    description:
      "Earn ratings after completed flights and build your public pilot profile over time.",
  },
];

const MEETING_STEPS = [
  {
    title: "Job goes live",
    description: "Client job is approved; eligible pilots see it on the board.",
  },
  {
    title: "Pilot wins bid",
    description: "Client accepts one offer — a booking is created automatically.",
  },
  {
    title: "Mission runs",
    description: "Both parties use messaging and status updates through completion.",
  },
  {
    title: "Close & reputation",
    description: "Payment records and mutual reviews lock in trust for next time.",
  },
];

export default function HowItWorksPage() {
  return (
    <MarketingPage
      badge="Platform"
      title="How it works"
      description="A clear path from job posting to pilot selection, mission delivery, payment, and reviews — built for aviation professionals."
    >
      <div className="space-y-14 sm:space-y-20">
        <section>
          <MarketingSectionHeader
            eyebrow="Overview"
            title="One marketplace, two journeys"
            description="Clients post verified work. Pilots bid with credentials. Everyone meets at the booking — with admin oversight at every gate."
          />
          <div className="mt-8 grid gap-5 sm:grid-cols-3 lg:mt-10">
            {[
              {
                step: "01",
                title: "Post & approve",
                text: "Clients describe missions; admins approve jobs before pilots can bid.",
              },
              {
                step: "02",
                title: "Bid & book",
                text: "Pilots submit offers; clients accept one pilot and a booking begins.",
              },
              {
                step: "03",
                title: "Fly & review",
                text: "Track the mission, complete payment records, and build ratings.",
              },
            ].map((item) => (
              <article key={item.step} className="premium-card p-6">
                <span className="font-mono text-2xl font-semibold text-gold">
                  {item.step}
                </span>
                <h3 className="mt-4 text-lg font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.text}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="premium-panel border-gold/20 p-6 sm:p-8 lg:p-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <MarketingSectionHeader
              eyebrow="Clients"
              title="Hiring a pilot"
              description="From first job post to final review — a guided workflow on your client dashboard."
            />
            <Button href="/for-clients" variant="secondary" size="sm">
              For clients
            </Button>
          </div>
          <div className="mt-8 lg:mt-10">
            <MarketingSteps steps={CLIENT_STEPS} variant="vertical" />
          </div>
        </section>

        <section className="premium-panel border-gold/20 p-6 sm:p-8 lg:p-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <MarketingSectionHeader
              eyebrow="Pilots"
              title="Winning missions"
              description="Onboarding, tier access, bidding, and bookings — designed for licensed operators."
            />
            <Button href="/for-pilots" variant="secondary" size="sm">
              For pilots
            </Button>
          </div>
          <div className="mt-8 lg:mt-10">
            <MarketingSteps steps={PILOT_STEPS} variant="vertical" />
          </div>
        </section>

        <section>
          <MarketingSectionHeader
            eyebrow="Together"
            title="Where both paths meet"
            description="Once a client accepts a bid, the marketplace shifts from discovery to delivery — with one booking both sides can trust."
          />
          <div className="mt-8 lg:mt-10">
            <MarketingSteps steps={MEETING_STEPS} />
          </div>
        </section>

        <section>
          <MarketingSectionHeader
            eyebrow="Trust & safety"
            title="Built for credible missions"
            description="Admin gates, single assignments, and post-completion reviews keep quality high for everyone."
          />
          <FeatureGrid
            className="mt-8 lg:mt-10"
            features={[
              {
                title: "Approved pilots only",
                description:
                  "Pilot profiles pass admin review before bidding on marketplace jobs.",
              },
              {
                title: "Approved jobs only",
                description:
                  "Client listings are moderated before pilots see them on the job board.",
              },
              {
                title: "One pilot per job",
                description:
                  "A single accepted bid creates one booking — no conflicting assignments.",
              },
              {
                title: "Reviews after completion",
                description:
                  "Ratings unlock only after a finished booking so feedback reflects real work.",
              },
              {
                title: "Verified documents",
                description:
                  "Pilots can submit license and insurance verifications for admin review.",
              },
              {
                title: "Support when needed",
                description:
                  "Talk to Support from any page if you need help with the platform.",
              },
            ]}
          />
          <p className="mt-6 text-center text-sm">
            <Link
              href="/pilots"
              className="font-medium text-gold-light hover:text-gold"
            >
              Browse approved pilots →
            </Link>
          </p>
        </section>

        <section>
          <MarketingSectionHeader
            eyebrow="Explore"
            title="Go deeper"
            description="Role-specific guides, pricing, and the public pilot directory."
          />
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:mt-10">
            <MarketingPathCard
              href="/for-clients"
              eyebrow="Clients"
              title="Hire pilots"
              description="Post jobs, compare bids, and manage bookings end to end."
            />
            <MarketingPathCard
              href="/for-pilots"
              eyebrow="Pilots"
              title="Find missions"
              description="Subscribe, bid on approved jobs, and grow your reputation."
            />
            <MarketingPathCard
              href="/pricing"
              eyebrow="Pricing"
              title="Plans & fees"
              description="Pilot membership tiers and platform commission explained."
            />
            <MarketingPathCard
              href="/pilots"
              eyebrow="Directory"
              title="Pilot profiles"
              description="Discover approved operators before you post a job."
            />
          </div>
        </section>

        <MarketingCta
          title="See it in action"
          description="Create an account and explore the dashboards built for the Phase 1 MVP demo."
          primaryHref="/register"
          primaryLabel="Create account"
          secondaryHref="/pricing"
          secondaryLabel="Pricing"
        />
      </div>
    </MarketingPage>
  );
}
