import { MarketingPage } from "@/components/layout/MarketingPage";
import { FeatureGrid } from "@/components/marketing/FeatureGrid";
import { MarketingCta } from "@/components/marketing/MarketingCta";
import { MarketingSectionHeader } from "@/components/marketing/MarketingSectionHeader";

export const metadata = {
  title: "About",
  description: "About Drone Pilot Marketplace — the professional hub for aerial services.",
};

export default function AboutPage() {
  return (
    <MarketingPage
      badge="Company"
      title="About us"
      description="We're building the professional marketplace the drone industry deserves."
    >
      <div className="space-y-14 sm:space-y-20">
        <section className="premium-panel p-6 sm:p-8 lg:p-10">
          <MarketingSectionHeader
            eyebrow="Mission"
            title="Aviation-grade connections"
            description="Licensed pilots and serious clients — one platform, not another generic gig board."
          />
          <div className="mt-6 space-y-4 text-base leading-relaxed text-muted-foreground">
            <p>
              <strong className="text-foreground">Drone Pilot Marketplace</strong>{" "}
              connects licensed pilots with clients who need aerial video, surveying,
              inspections, real estate media, events, and more — with workflows designed
              for aviation professionals.
            </p>
            <p>
              Phase 1 focuses on a trustworthy core loop: post jobs, approve listings,
              bid, book, complete, pay, and review. We&apos;re shipping module by module
              with clear documentation and demo accounts so teams can test every step.
            </p>
          </div>
        </section>

        <section>
          <MarketingSectionHeader
            eyebrow="Values"
            title="What we stand for"
            description="The principles behind every feature we ship."
          />
          <FeatureGrid
            className="mt-8 lg:mt-10"
            features={[
              {
                title: "Professional",
                description:
                  "Admin-reviewed jobs and approved pilots keep the marketplace credible.",
              },
              {
                title: "Transparent",
                description:
                  "Published rates, commission rules, and booking status — no surprises.",
              },
              {
                title: "Aviation-first",
                description:
                  "Compliance checklists, license capture, and mission-oriented language.",
              },
              {
                title: "Demo-ready",
                description:
                  "Seeded accounts and docs so stakeholders can walk through the full flow.",
              },
              {
                title: "Modular growth",
                description:
                  "Features roll out in clear modules — auth, jobs, bids, bookings, and beyond.",
              },
              {
                title: "Design-forward",
                description:
                  "Interim dark and gold UI today; Figma-aligned polish on the roadmap.",
              },
            ]}
          />
        </section>

        <section className="rounded-lg border border-border bg-surface-elevated p-6 sm:p-8">
          <MarketingSectionHeader
            eyebrow="Phase 1"
            title="What&apos;s live today"
            description="A working MVP you can explore end to end."
          />
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {[
              "Client and pilot registration with role dashboards",
              "Job posting, admin approval, and pilot bidding",
              "Bookings, demo payments, and mutual reviews",
              "Public pilot directory and membership tiers",
              "Verifications, certificates, wings, and uniform shop (demo)",
              "In-app support chat and admin moderation tools",
            ].map((item) => (
              <li
                key={item}
                className="flex gap-2 text-sm text-muted-foreground"
              >
                <span className="text-gold" aria-hidden>
                  ·
                </span>
                {item}
              </li>
            ))}
          </ul>
        </section>

        <MarketingCta
          title="Join the marketplace"
          description="Whether you hire pilots or fly missions — get started in minutes."
          primaryHref="/register"
          primaryLabel="Get started"
          secondaryHref="/how-it-works"
          secondaryLabel="How it works"
        />
      </div>
    </MarketingPage>
  );
}
