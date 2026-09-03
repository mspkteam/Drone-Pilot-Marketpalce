import Image from "next/image";
import Link from "next/link";
import { brandClasses } from "@/lib/design/brand";
import { HOME_HERO } from "@/lib/marketing/home-content";
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
        "figma-home-hero-panel relative flex min-h-[20rem] flex-col justify-end overflow-hidden sm:min-h-[26rem] lg:min-h-[32rem] xl:min-h-[36rem]",
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

      <div className="relative z-10 px-6 py-10 sm:px-12 sm:py-14 lg:px-16 lg:py-16">
        <span className="ras-eyebrow-pill">
          <span className="ras-eyebrow-pill-dot" aria-hidden />
          {eyebrow}
        </span>
        <h1 className="ras-hero-title mt-6 max-w-lg text-[1.875rem] leading-[1.08] sm:text-4xl lg:text-[3rem]">
          {isClient ? (
            <>
              Find Local Drone Pilots{" "}
              <span className="ras-hero-title-accent">Anywhere</span>
            </>
          ) : (
            title
          )}
        </h1>
        <p className="ras-hero-body mt-4 max-w-lg text-base sm:text-lg">{description}</p>
        <Link
          href={ctaHref}
          className={cn(
            "mt-8 w-full max-w-sm sm:w-auto sm:max-w-none",
            isClient ? brandClasses.btnHomeGold : brandClasses.btnHomeHeroLight,
          )}
        >
          <span>{ctaLabel}</span>
          {isClient ? (
            <ArrowIcon className="h-[0.9375rem] w-[0.9375rem] shrink-0" />
          ) : (
            <PlaneIcon className="h-[1.0625rem] w-[1.21875rem] shrink-0" />
          )}
        </Link>
      </div>
    </article>
  );
}

export function HomeHeroDual() {
  return (
    <section className="figma-home-hero" aria-label="Hero">
      <div className="public-container py-6 sm:py-8 lg:py-10">
        <div className="figma-home-hero-inner grid lg:grid-cols-2">
          <HeroPanel
            variant="client"
            eyebrow={HOME_HERO.client.eyebrow}
            title={HOME_HERO.client.title}
            description={HOME_HERO.client.description}
            ctaLabel={HOME_HERO.client.ctaLabel}
            ctaHref={HOME_HERO.client.ctaHref}
            imageSrc={homeAssets.heroDrone}
            imageAlt="Professional drone flying over terrain at dusk"
          />
          <HeroPanel
            variant="pilot"
            eyebrow={HOME_HERO.pilot.eyebrow}
            title={HOME_HERO.pilot.title}
            description={HOME_HERO.pilot.description}
            ctaLabel={HOME_HERO.pilot.ctaLabel}
            ctaHref={HOME_HERO.pilot.ctaHref}
            imageSrc={homeAssets.heroPilot}
            imageAlt="Drone pilot in mission control environment"
          />
        </div>
      </div>
    </section>
  );
}
