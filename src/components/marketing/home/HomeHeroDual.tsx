import Image from "next/image";
import Link from "next/link";
import { homeAssets } from "@/lib/marketing/home-assets";
import { cn } from "@/lib/utils";

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

function PlaneIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 18"
      fill="currentColor"
      aria-hidden
    >
      <path d="M10 0l2.2 5.5L18 7.5l-4.5 4 1 6.5L10 15l-4.5 3 1-6.5L2 7.5l5.8-2L10 0z" />
    </svg>
  );
}

type HeroPanelProps = {
  variant: "client" | "pilot";
  eyebrow: string;
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  imageSrc: string;
  imageAlt: string;
};

function HeroPanel({
  variant,
  eyebrow,
  title,
  description,
  ctaLabel,
  ctaHref,
  imageSrc,
  imageAlt,
}: HeroPanelProps) {
  const isClient = variant === "client";

  return (
    <article
      className={cn(
        "figma-home-hero-panel relative flex min-h-[28rem] flex-col justify-end overflow-hidden sm:min-h-[32rem] lg:min-h-[36rem] lg:min-h-[57.5rem]",
        isClient &&
          "border-b border-[var(--color-border-muted)] lg:border-b-0 lg:border-r",
      )}
    >
      <Image
        src={imageSrc}
        alt={imageAlt}
        fill
        priority
        className={cn("object-cover", isClient ? "opacity-60" : "opacity-40")}
        sizes="(max-width: 1024px) 100vw, 50vw"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[var(--color-bg-deeper)] via-[var(--color-bg-deeper)]/40 to-transparent"
        aria-hidden
      />

      <div className="relative z-10 px-8 py-10 sm:px-12 sm:py-14 lg:px-16 lg:py-16">
        <span className="ras-eyebrow-pill">
          <span className="ras-eyebrow-pill-dot" aria-hidden />
          {eyebrow}
        </span>
        <h1 className="ras-hero-title mt-6 max-w-lg text-3xl sm:text-4xl lg:text-[3rem]">
          {isClient ? (
            <>
              Find Local Drone Pilots <span className="text-gold">Anywhere</span>
            </>
          ) : (
            title
          )}
        </h1>
        <p className="ras-hero-body mt-4 max-w-lg text-base sm:text-lg">{description}</p>
        <Link
          href={ctaHref}
          className={cn("mt-8", isClient ? "ras-btn-primary" : "ras-btn-outline")}
        >
          {ctaLabel}
          {isClient ? (
            <ArrowIcon className="h-4 w-4" />
          ) : (
            <PlaneIcon className="h-4 w-4" />
          )}
        </Link>
      </div>
    </article>
  );
}

export function HomeHeroDual() {
  return (
    <section
      className="figma-home-hero border-b border-[var(--color-border-muted)]"
      aria-label="Hero"
    >
      <div className="grid lg:grid-cols-2">
        <HeroPanel
          variant="client"
          eyebrow="For Businesses"
          title="Find Local Drone Pilots Anywhere"
          description="Book qualified drone operators for inspections, mapping, real estate, construction, agriculture, public safety, and more."
          ctaLabel="Find a drone pilot"
          ctaHref="/for-clients"
          imageSrc={homeAssets.heroDrone}
          imageAlt="Professional drone flying over terrain at dusk"
        />
        <HeroPanel
          variant="pilot"
          eyebrow="For Pilots"
          title="Get Paid Flying Missions"
          description="Join a global network of drone professionals and submit proposals for amazing opportunities from businesses in your area."
          ctaLabel="Join the Pilot Network"
          ctaHref="/register?role=pilot"
          imageSrc={homeAssets.heroPilot}
          imageAlt="Drone pilot in mission control environment"
        />
      </div>
    </section>
  );
}
