import { HOME_SOP_STEPS } from "@/lib/marketing/home-content";

export function HomeSopSection() {
  return (
    <section
      className="figma-home-section border-t border-[var(--color-border)]"
      aria-label="Standard operating procedure"
    >
      <div className="public-container">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="ras-hero-title text-2xl uppercase sm:text-[2rem]">
            Standard Operating Procedure
          </h2>
          <p className="ras-hero-body mt-4 text-base">
            The standardized workflow from beginning to end is the same for every
            mission, with only the key details changing.
          </p>
        </div>

        <ol className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {HOME_SOP_STEPS.map((step) => (
            <li key={step.number} className="figma-home-sop-step relative">
              <span
                className="figma-home-sop-number pointer-events-none absolute -left-2 -top-16 font-mono text-[7rem] font-bold leading-none text-white/[0.04] sm:text-[9rem]"
                aria-hidden
              >
                {step.number}
              </span>
              <div className="relative border-t border-border/80 pt-8">
                <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-gold">
                  {step.title}
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
