import { MarketingSectionLabel } from "@/components/marketing/figma/MarketingSectionLabel";
import { CLIENT_HOW_IT_WORKS_STEPS } from "@/lib/marketing/for-clients-content";

export function ClientHowItWorks() {
  return (
    <section
      className="figma-marketing-section border-y border-[var(--color-border-gold-subtle)] bg-[rgba(21,17,12,0.3)]"
      aria-label="How it works"
    >
      <div className="public-container">
        <div className="mx-auto max-w-2xl text-center">
          <MarketingSectionLabel centered>How It Works</MarketingSectionLabel>
          <h2 className="ras-marketing-section-title mt-3">
            Hire a Pilot in 5 Simple Steps
          </h2>
        </div>
        <ol className="figma-client-steps-grid mt-10 grid grid-cols-1 gap-5 pt-6 sm:grid-cols-2 lg:mt-14 lg:grid-cols-5">
          {CLIENT_HOW_IT_WORKS_STEPS.map((step) => (
            <li
              key={step.number}
              className="figma-marketing-card relative px-[25px] pb-[25px] pt-[2.3125rem]"
            >
              <span className="figma-client-step-badge absolute -top-4 left-6">
                {step.number}
              </span>
              <h3 className="text-base font-bold tracking-[-0.02em] text-ras-heading">
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
