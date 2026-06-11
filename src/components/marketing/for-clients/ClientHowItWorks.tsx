import { MarketingSectionLabel } from "@/components/marketing/figma/MarketingSectionLabel";
import { CLIENT_HOW_IT_WORKS_STEPS } from "@/lib/marketing/for-clients-content";

export function ClientHowItWorks() {
  return (
    <section
      className="figma-marketing-section border-y border-ras-gold-subtle bg-[rgba(21,17,12,0.3)]"
      aria-label="How it works"
    >
      <div className="public-container py-20">
        <div className="mx-auto max-w-2xl text-center">
          <MarketingSectionLabel centered>How It Works</MarketingSectionLabel>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-ras-heading sm:text-4xl">
            Hire a Pilot in 5 Simple Steps
          </h2>
        </div>
        <ol className="figma-client-steps-scroll mt-14 flex gap-5 overflow-x-auto pb-4 pt-4 lg:grid lg:grid-cols-5 lg:overflow-visible">
          {CLIENT_HOW_IT_WORKS_STEPS.map((step) => (
            <li
              key={step.number}
              className="figma-marketing-card relative min-w-[14rem] shrink-0 px-6 pb-6 pt-9 lg:min-w-0"
            >
              <span className="absolute -top-4 left-6 flex h-9 w-9 items-center justify-center rounded-lg bg-gold text-sm font-bold text-ras-cta shadow-lg">
                {step.number}
              </span>
              <h3 className="text-base font-bold tracking-tight text-ras-heading">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ras-warm">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
