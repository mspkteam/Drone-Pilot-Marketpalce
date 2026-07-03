import Link from "next/link";
import { brandClasses } from "@/lib/design/brand";

export function ClientSafetyCta() {
  return (
    <section className="figma-marketing-section pt-0" aria-label="Safety">
      <div className="public-container">
        <div className="rounded-[14px] border border-[var(--color-border-gold-subtle)] bg-[rgba(21,17,12,0.4)] p-8 sm:p-10 lg:p-14">
          <h2 className="ras-marketing-section-title max-w-2xl text-[1.75rem] leading-tight sm:text-[1.875rem]">
            Professional Flights Require Professional Pilots
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-ras-warm">
            Every project depends on safe planning, proper pilot checks, and clear
            communication.
          </p>
          <Link
            href="/safety"
            className={`${brandClasses.btnHomeGold} ras-btn-home-gold--sentence mt-8 w-full max-w-xs sm:w-auto sm:max-w-none`}
          >
            Learn About Safety
          </Link>
        </div>
      </div>
    </section>
  );
}
