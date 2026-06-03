import { MarketingPage } from "@/components/layout/MarketingPage";
import { MarketingCta } from "@/components/marketing/MarketingCta";

export const metadata = {
  title: "About",
  description: "About Drone Pilot Marketplace — the professional hub for aerial services.",
};

export default function AboutPage() {
  return (
    <MarketingPage
      title="About us"
      description="We're building the professional marketplace the drone industry deserves."
    >
      <div className="prose prose-neutral max-w-none space-y-8 text-muted-foreground">
        <section className="space-y-4 text-base leading-relaxed">
          <p>
            <strong className="text-foreground">Drone Pilot Marketplace</strong> connects
            licensed pilots with clients who need aerial video, surveying, inspections,
            real estate media, events, and more — with workflows designed for aviation
            professionals, not generic gig platforms.
          </p>
          <p>
            Phase 1 focuses on a trustworthy core loop: post jobs, approve listings, bid,
            book, complete, pay, and review. We&apos;re shipping module by module with
            clear documentation and demo accounts so teams can test every step.
          </p>
        </section>

        <section className="grid gap-6 sm:grid-cols-3">
          {[
            {
              title: "Professional",
              text: "Admin-reviewed jobs and approved pilots keep the marketplace credible.",
            },
            {
              title: "Transparent",
              text: "Published rates, commission rules, and booking status — no surprises.",
            },
            {
              title: "Aviation-first",
              text: "Compliance checklists, license capture, and mission-oriented language.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-lg border border-border bg-surface-elevated p-5"
            >
              <h2 className="text-sm font-semibold text-foreground">{item.title}</h2>
              <p className="mt-2 text-sm">{item.text}</p>
            </div>
          ))}
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
