import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type SplitPanelProps = {
  side: "client" | "pilot";
  eyebrow: string;
  title: string;
  description: string;
  highlights: string[];
  exploreHref: string;
  exploreLabel: string;
  registerHint: string;
};

function IconClient({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 21h16.5M4.5 3h15v18h-15V3zm4.5 0v18m6-18v18M9 8.25h1.5m-1.5 3h1.5m-1.5 3h1.5m4.5-6H15m-1.5 3H15m-1.5 3H15"
      />
    </svg>
  );
}

function IconPilot({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3l2.5 6.5L21 11l-5 4.5L17 21l-5-3-5 3 1-5.5L3 11l6.5-1.5L12 3z"
      />
    </svg>
  );
}

function SplitPanel({
  side,
  eyebrow,
  title,
  description,
  highlights,
  exploreHref,
  exploreLabel,
  registerHint,
}: SplitPanelProps) {
  const isClient = side === "client";
  const Icon = isClient ? IconClient : IconPilot;

  return (
    <article
      className={cn(
        "home-split-panel group relative flex min-h-[22rem] flex-col justify-between p-8 sm:min-h-[26rem] sm:p-10 lg:min-h-[32rem] lg:p-12",
        isClient ? "home-split-panel--client" : "home-split-panel--pilot",
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
        aria-hidden
      />

      <div className="relative">
        <span
          className={cn(
            "inline-flex h-12 w-12 items-center justify-center rounded-xl border bg-gold/10 text-gold",
            isClient ? "border-gold/35" : "border-gold/40",
          )}
        >
          <Icon className="h-6 w-6" />
        </span>
        <p className="mt-5 text-xs font-medium uppercase tracking-[0.2em] text-gold">
          {eyebrow}
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl lg:text-[1.75rem] xl:text-3xl">
          {title}
        </h2>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-neutral-400 sm:text-base">
          {description}
        </p>
      </div>

      <div className="relative mt-8 lg:mt-10">
        <ul className="space-y-3">
          {highlights.map((item) => (
            <li
              key={item}
              className="flex gap-3 text-sm leading-relaxed text-neutral-300"
            >
              <span
                className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold shadow-[0_0_8px_rgba(201,162,39,0.6)]"
                aria-hidden
              />
              {item}
            </li>
          ))}
        </ul>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <Button href={exploreHref} size="lg">
            {exploreLabel}
          </Button>
          <Link
            href="/register"
            className="text-sm font-medium text-gold-light transition-colors hover:text-gold"
          >
            {registerHint} →
          </Link>
        </div>
      </div>
    </article>
  );
}

export function HomeSplitBanner() {
  return (
    <section className="home-split-banner" aria-label="Choose your path">
      <div className="relative grid lg:grid-cols-2">
        <div
          className="pointer-events-none absolute bottom-0 left-1/2 top-0 z-10 hidden w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-gold/50 to-transparent lg:block"
          aria-hidden
        />
        <SplitPanel
          side="client"
          eyebrow="For clients"
          title="Hire licensed drone pilots"
          description="Post aerial missions, compare verified bids, and run bookings from approval through payment — without chasing operators on generic job boards."
          highlights={[
            "Admin-reviewed job listings before pilots can bid",
            "Compare rates, timelines, and pilot profiles side by side",
            "Bookings, demo payments, and reviews in one dashboard",
          ]}
          exploreHref="/for-clients"
          exploreLabel="Explore for clients"
          registerHint="Create client account"
        />
        <SplitPanel
          side="pilot"
          eyebrow="For pilots"
          title="Win paid aerial missions"
          description="Get profile approval, pick a membership tier, and bid on real client work — build ratings that strengthen your public pilot profile."
          highlights={[
            "Curated job board with admin-approved opportunities",
            "Membership tiers A-1 through A-6 for visibility and bidding",
            "Certificates, wings, and reviews after completed flights",
          ]}
          exploreHref="/for-pilots"
          exploreLabel="Explore for pilots"
          registerHint="Join as a pilot"
        />
      </div>
    </section>
  );
}
