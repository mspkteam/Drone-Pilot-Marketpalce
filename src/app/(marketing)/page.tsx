import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { PublicPageContainer } from "@/components/layout/PublicPageContainer";
import { HomeSplitBanner } from "@/components/marketing/HomeSplitBanner";
import { MarketingCta } from "@/components/marketing/MarketingCta";
import { MarketingSectionHeader } from "@/components/marketing/MarketingSectionHeader";

export default function HomePage() {
  return (
    <>
      <section className="marketing-hero border-b border-border/80">
        <PublicPageContainer className="py-12 text-center sm:py-16 lg:py-20">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-gold">
            Aviation-grade drone operations
          </p>
          <h1 className="mx-auto mt-4 max-w-4xl text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
            The marketplace for licensed drone pilots
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-neutral-400 sm:text-lg">
            One professional platform for clients who need aerial work and pilots
            who are ready to fly — moderated jobs, clear bids, and trusted
            bookings.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button href="/register" size="lg">
              Get started
            </Button>
            <Button href="/how-it-works" variant="outline" size="lg">
              How it works
            </Button>
          </div>
        </PublicPageContainer>
      </section>

      <HomeSplitBanner />

      <section className="marketing-section">
        <PublicPageContainer>
          <div className="mx-auto max-w-2xl text-center">
            <MarketingSectionHeader
              eyebrow="Simple flow"
              title="How it works"
              description="Three steps from listing to lift-off — with admin oversight at every gate."
            />
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-3 lg:mt-12">
            {[
              {
                step: "01",
                title: "Post or browse",
                text: "Clients post approved jobs. Pilots browse work that matches their credentials.",
              },
              {
                step: "02",
                title: "Bid & accept",
                text: "Pilots submit proposals. Clients review and accept the right pilot for the mission.",
              },
              {
                step: "03",
                title: "Fly & review",
                text: "Track booking status, complete the job, and build trust with reviews.",
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
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button href="/how-it-works" variant="secondary">
              Full walkthrough
            </Button>
            <Link
              href="/pilots"
              className="text-sm font-medium text-gold-light hover:text-gold"
            >
              Browse pilot directory →
            </Link>
          </div>
        </PublicPageContainer>
      </section>

      <section className="marketing-section border-t border-border bg-surface/40">
        <PublicPageContainer>
          <MarketingCta
            title="Ready to take flight?"
            description="Join as a client or pilot and explore the live demo — dashboards, bids, bookings, and support chat included."
            primaryHref="/register"
            primaryLabel="Create account"
            secondaryHref="/pricing"
            secondaryLabel="View pricing"
          />
        </PublicPageContainer>
      </section>
    </>
  );
}
