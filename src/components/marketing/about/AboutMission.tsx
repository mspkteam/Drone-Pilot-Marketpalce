import Image from "next/image";
import { aboutAssets } from "@/lib/marketing/about-assets";

export function AboutMission() {
  return (
    <section
      className="figma-about-section figma-marketing-section"
      aria-label="Our mission"
    >
      <div className="public-container">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="relative min-h-[18rem] overflow-hidden rounded-[14px] border border-ras-gold-subtle sm:min-h-[22rem] lg:min-h-[26rem]">
            <Image
              src={aboutAssets.missionImage}
              alt="Commercial drone in flight"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          </div>
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-ras-text sm:text-[2.25rem]">
              Our Mission
            </h2>
            <p className="mt-4 text-lg font-semibold leading-snug text-gold sm:text-xl">
              Making drone services easier, safer, and more professional.
            </p>
            <p className="mt-5 max-w-lg text-base leading-[1.7] text-ras-soft">
              We help clients find trusted drone pilots while giving pilots a
              structured platform to grow their reputation and business.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
