import Link from "next/link";
import { MarketingSectionLabel } from "@/components/marketing/figma/MarketingSectionLabel";
import { CONTACT_QUICK_HELP_LINKS } from "@/lib/marketing/contact-content";

function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden
    >
      <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ContactQuickHelp() {
  return (
    <section
      className="figma-contact-section figma-marketing-section border-t border-[rgba(255,255,255,0.05)]"
      aria-label="Quick help"
    >
      <div className="public-container">
        <MarketingSectionLabel>Quick Help</MarketingSectionLabel>
        <h2 className="mt-4 max-w-2xl text-3xl font-extrabold tracking-tight text-ras-text sm:text-4xl">
          Looking for Something Specific?
        </h2>
        <ul className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          {CONTACT_QUICK_HELP_LINKS.map((link) => (
            <li key={link.label} className="sm:flex-1 sm:min-w-[11rem]">
              <Link
                href={link.href}
                className="group flex h-12 items-center justify-between gap-3 rounded-lg border border-[rgba(216,179,57,0.22)] bg-surface px-4 text-sm font-semibold text-ras-muted transition-colors hover:border-[rgba(216,179,57,0.45)] hover:text-ras-text"
              >
                <span>{link.label}</span>
                <ArrowIcon className="h-4 w-4 shrink-0 text-ras-soft transition-colors group-hover:text-gold" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
