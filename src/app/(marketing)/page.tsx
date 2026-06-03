import { Button } from "@/components/ui/Button";
import { MarketingHero } from "@/components/marketing/MarketingHero";
import { MarketingCta } from "@/components/marketing/MarketingCta";

export default function HomePage() {
  return (
    <>
      <MarketingHero
        eyebrow="Aviation-grade drone operations"
        title="The marketplace for licensed drone pilots"
        description="Connect with certified pilots for aerial video, surveys, inspections, events, and real estate — managed end-to-end on one professional platform."
      >
        <Button href="/register">Get started</Button>
        <Button href="/for-clients" variant="secondary">
          I need a pilot
        </Button>
        <Button href="/for-pilots" variant="secondary">
          I&apos;m a pilot
        </Button>
      </MarketingHero>

      <section className="marketing-section">
        <h2 className="text-center text-sm font-medium uppercase tracking-[0.2em] text-gold">
          How it works
        </h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
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
            <div key={item.step} className="premium-card p-6">
              <span className="font-mono text-2xl font-semibold text-gold">
                {item.step}
              </span>
              <h3 className="mt-4 text-lg font-semibold text-foreground">
                {item.title}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">{item.text}</p>
            </div>
          ))}
        </div>
        <div className="mt-12 text-center">
          <Button href="/how-it-works" variant="secondary">
            Learn more
          </Button>
        </div>
      </section>

      <section className="border-t border-border bg-surface/50">
        <div className="marketing-section py-16 text-center">
          <MarketingCta
            title="Ready to take flight?"
            description="Join as a client or pilot. The marketplace is live for demo review — full Figma-aligned UI coming next."
            primaryHref="/register"
            primaryLabel="Create account"
            secondaryHref="/pricing"
            secondaryLabel="View pricing"
          />
        </div>
      </section>
    </>
  );
}
