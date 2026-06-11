import Link from "next/link";

export function ClientPageHero() {
  return (
    <section className="figma-client-hero ras-hero-section relative overflow-hidden">
      <div className="ras-gold-glow -right-32 top-0 h-[35rem] w-[37.5rem]" aria-hidden />
      <div className="public-container relative py-24 sm:py-28 lg:py-32">
        <div className="max-w-3xl">
          <span className="ras-eyebrow-pill">
            <span className="ras-eyebrow-pill-dot" aria-hidden />
            For Clients
          </span>
          <h1 className="ras-hero-title mt-6 text-4xl sm:text-5xl lg:text-[3.75rem]">
            Find the Right Drone Pilot for{" "}
            <span className="text-gold">Your Project</span>
          </h1>
          <p className="ras-hero-body mt-6 max-w-xl text-lg">
            Aerial photography, inspections, mapping, or event coverage — Remote Air
            Service connects you with verified drone pilots quickly and safely.
          </p>
          <Link href="/register?role=client" className="ras-btn-primary mt-8">
            Post a Drone Project
          </Link>
        </div>
      </div>
    </section>
  );
}
