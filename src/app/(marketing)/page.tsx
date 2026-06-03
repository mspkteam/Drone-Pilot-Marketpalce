import { Button } from "@/components/ui/Button";

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-border bg-foreground text-background">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(201,162,39,0.12)_0%,transparent_50%)]" />
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28 lg:py-32">
          <p className="text-sm font-medium uppercase tracking-widest text-gold">
            Aviation-grade drone operations
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            The marketplace for licensed drone pilots
          </h1>
          <p className="mt-6 max-w-xl text-lg text-neutral-400">
            Connect with certified pilots for aerial video, surveys, inspections,
            events, and real estate — managed end-to-end on one professional
            platform.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <Button href="/register">Get started</Button>
            <Button href="/for-clients" variant="outline" className="border-neutral-600 text-background hover:border-gold hover:text-gold">
              I need a pilot
            </Button>
            <Button href="/for-pilots" variant="outline" className="border-neutral-600 text-background hover:border-gold hover:text-gold">
              I&apos;m a pilot
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <h2 className="text-center text-sm font-medium uppercase tracking-wider text-gold">
          How it works
        </h2>
        <div className="mt-10 grid gap-8 sm:grid-cols-3">
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
            <div
              key={item.step}
              className="rounded-lg border border-border bg-surface-elevated p-6"
            >
              <span className="font-mono text-2xl font-semibold text-gold">
                {item.step}
              </span>
              <h3 className="mt-4 text-lg font-semibold">{item.title}</h3>
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

      <section className="border-t border-border bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6">
          <h2 className="text-2xl font-semibold sm:text-3xl">
            Ready to take flight?
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
            Join as a client or pilot. Phase 1 marketplace features roll out
            module by module.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap">
            <Button href="/register">Create account</Button>
            <Button href="/pilots" variant="secondary">
              Find pilots
            </Button>
            <Button href="/waitlist?source=home" variant="outline">
              Join waitlist
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
