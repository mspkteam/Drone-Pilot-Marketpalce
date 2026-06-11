import { MarketingSectionLabel } from "@/components/marketing/figma/MarketingSectionLabel";
import { PILOT_PROFILE_MOCK } from "@/lib/marketing/for-pilots-content";

function LocationPin() {
  return (
    <svg
      className="h-3 w-3 shrink-0 text-ras-dim-alt"
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.25}
        d="M6 10.5S2.5 7.5 2.5 5a3.5 3.5 0 117 0c0 2.5-3.5 5.5-3.5 5.5z"
      />
      <circle cx="6" cy="5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function PilotProfileSection() {
  const pilot = PILOT_PROFILE_MOCK;

  return (
    <section
      className="figma-pilot-section figma-marketing-section"
      aria-label="Pilot profile"
    >
      <div className="public-container">
        <div className="flex flex-col items-start gap-10 lg:flex-row lg:items-center lg:justify-between lg:gap-16">
          <div className="max-w-xl shrink-0">
            <MarketingSectionLabel>Pilot Profile</MarketingSectionLabel>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-ras-text sm:text-4xl">
              Your Aviation-Style Pilot Card
            </h2>
          </div>

          <div className="figma-pilot-profile-card w-full max-w-[30rem] shrink-0 rounded-xl border border-[rgba(216,179,57,0.45)] bg-ras-card-warm p-6 shadow-[0_0_40px_rgba(216,179,57,0.08)] lg:max-w-[32rem]">
            <div className="flex items-start justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gold text-sm font-extrabold text-ras-cta"
                  aria-hidden
                >
                  {pilot.initials}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-[15px] font-bold text-ras-text">
                    {pilot.name}
                  </p>
                  <p className="mt-1 flex items-center gap-1 text-xs text-ras-dim-alt">
                    <LocationPin />
                    {pilot.branch}
                  </p>
                </div>
              </div>
              <span className="shrink-0 rounded-full border border-[rgba(216,179,57,0.35)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-gold">
                {pilot.rank}
              </span>
            </div>
            <ul className="mt-5 flex flex-wrap gap-2">
              {pilot.tags.map((tag) => (
                <li
                  key={tag}
                  className="rounded-full border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.04)] px-2 py-1 text-[11px] text-ras-muted"
                >
                  {tag}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
