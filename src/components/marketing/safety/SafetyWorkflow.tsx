import { MarketingSectionLabel } from "@/components/marketing/figma/MarketingSectionLabel";
import { SAFETY_WORKFLOW_STEPS } from "@/lib/marketing/safety-content";

export function SafetyWorkflow() {
  return (
    <section
      className="figma-safety-workflow-section figma-marketing-section"
      aria-label="Hire a pilot workflow"
    >
      <div className="public-container">
        <div className="mx-auto max-w-2xl text-center">
          <MarketingSectionLabel centered>How It Works</MarketingSectionLabel>
          <h2 className="ras-marketing-section-title mt-3">
            Hire a Pilot in 5 Simple Steps
          </h2>
        </div>
        <ol className="mt-12 grid gap-5 pt-4 sm:grid-cols-2 lg:grid-cols-3">
          {SAFETY_WORKFLOW_STEPS.map((step) => (
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
              <p className="mt-2 text-sm leading-[1.45] text-ras-warm">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
