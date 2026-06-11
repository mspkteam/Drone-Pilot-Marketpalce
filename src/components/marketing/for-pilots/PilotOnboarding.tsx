import { MarketingSectionLabel } from "@/components/marketing/figma/MarketingSectionLabel";
import { PILOT_ONBOARDING_STEPS } from "@/lib/marketing/for-pilots-content";

export function PilotOnboarding() {
  return (
    <section
      className="figma-pilot-onboarding figma-marketing-section border-t border-[rgba(255,255,255,0.05)]"
      aria-label="Onboarding"
    >
      <div className="public-container">
        <div className="mx-auto max-w-2xl text-center">
          <MarketingSectionLabel centered>Onboarding</MarketingSectionLabel>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-ras-text sm:text-4xl">
            From Application to First Flight
          </h2>
        </div>
        <ol className="figma-client-steps-scroll mt-14 flex gap-5 overflow-x-auto pb-4 pt-4 lg:grid lg:grid-cols-5 lg:overflow-visible">
          {PILOT_ONBOARDING_STEPS.map((step) => (
            <li
              key={step.number}
              className="figma-marketing-card relative min-w-[15rem] shrink-0 px-6 pb-6 pt-9 lg:min-w-0"
            >
              <span className="absolute -top-4 left-6 flex h-9 w-9 items-center justify-center rounded-md bg-gold text-xs font-extrabold text-ras-cta shadow-lg">
                {step.number}
              </span>
              <h3 className="text-sm font-bold tracking-tight text-ras-text">
                {step.title}
              </h3>
              <p className="mt-2 text-[13px] leading-[1.5] text-ras-dim-alt">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
