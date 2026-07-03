import Image from "next/image";
import { HOME_CAPABILITIES } from "@/lib/marketing/home-content";
import { homeAssets } from "@/lib/marketing/home-assets";

const CAPABILITY_ICONS = [
  homeAssets.capabilities.usa,
  homeAssets.capabilities.europe,
] as const;

export function HomeCapabilities() {
  return (
    <section
      className="figma-home-section figma-home-capabilities border-t border-[var(--color-border-muted)]"
      aria-label="Regional capabilities"
    >
      <div className="public-container">
        <div className="grid items-stretch gap-8 sm:gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
          <div className="min-w-0">
            <h2 className="ras-hero-title text-2xl sm:text-[2rem]">Capabilities</h2>
            <ul className="mt-8 space-y-8 sm:mt-10 sm:space-y-10">
              {HOME_CAPABILITIES.map((item, index) => (
                <li key={item.title} className="flex items-start gap-4 sm:gap-5">
                  <div className="figma-home-capability-icon" aria-hidden>
                    <Image
                      src={CAPABILITY_ICONS[index]}
                      alt=""
                      width={20}
                      height={20}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--color-home-btn-light)] break-words">
                      {item.title}
                    </h3>
                    <p className="ras-hero-body mt-3 text-sm leading-relaxed sm:text-base">
                      {item.description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="figma-home-capabilities-map w-full">
            <Image
              src={homeAssets.capabilities.map}
              alt="Global operations map"
              fill
              className="figma-home-capabilities-map-image object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
