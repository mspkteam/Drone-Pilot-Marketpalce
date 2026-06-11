import Link from "next/link";

export function ClientSafetyCta() {
  return (
    <section className="figma-marketing-section pt-0" aria-label="Safety">
      <div className="public-container">
        <div className="rounded-[18px] border border-ras-gold-subtle bg-[rgba(21,17,12,0.4)] p-10 sm:p-14">
          <h2 className="max-w-2xl text-2xl font-bold tracking-tight text-ras-heading sm:text-3xl">
            Professional Flights Require Professional Pilots
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-ras-warm">
            Every project depends on safe planning, proper pilot checks, and clear
            communication.
          </p>
          <Link
            href="/safety"
            className="mt-8 inline-flex h-10 items-center rounded-lg bg-gold px-8 text-sm font-semibold text-ras-cta transition-colors hover:bg-gold-light"
          >
            Learn About Safety
          </Link>
        </div>
      </div>
    </section>
  );
}
