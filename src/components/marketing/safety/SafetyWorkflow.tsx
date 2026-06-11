import { MarketingSectionLabel } from "@/components/marketing/figma/MarketingSectionLabel";
import { SAFETY_WORKFLOW_STEPS } from "@/lib/marketing/safety-content";

export function SafetyWorkflow() {
  return (
    <section
      className="figma-safety-section figma-marketing-section border-t border-[rgba(255,255,255,0.05)]"
      aria-label="Hire a pilot workflow"
    >
      <div className="public-container">
        <div className="mx-auto max-w-2xl text-center">
          <MarketingSectionLabel centered>How It Works</MarketingSectionLabel>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-ras-text sm:text-[2.25rem]">
            Hire a Pilot in 5 Simple Steps
          </h2>
        </div>
        <ol className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SAFETY_WORKFLOW_STEPS.map((step) => (
            <li
              key={step.number}
              className="relative rounded-[10px] border border-ras-gold-subtle bg-ras-card px-6 pb-6 pt-9"
            >
              <span className="absolute left-6 top-0 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md bg-gold text-xs font-extrabold text-ras-cta shadow-lg">
                {step.number}
              </span>
              <h3 className="text-base font-bold tracking-tight text-ras-text">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ras-soft">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
