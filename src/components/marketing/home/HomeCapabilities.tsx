import Image from "next/image";
import { HOME_CAPABILITIES } from "@/lib/marketing/home-content";
import { homeAssets } from "@/lib/marketing/home-assets";

const CAPABILITY_ICONS = [
  homeAssets.capabilities.usa,
  homeAssets.capabilities.europe,
] as const;

export function HomeCapabilities() {
  return (
    <section className="figma-home-section border-t border-border" aria-label="Regional capabilities">
      <div className="public-container">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <h2 className="ras-hero-title text-2xl sm:text-[2rem]">Capabilities</h2>
            <ul className="mt-10 space-y-10">
              {HOME_CAPABILITIES.map((item, index) => (
                <li key={item.title} className="flex gap-5">
                  <Image
                    src={CAPABILITY_ICONS[index]}
                    alt=""
                    width={40}
                    height={40}
                    className="h-10 w-10 shrink-0 object-contain"
                    aria-hidden
                  />
                  <div>
                    <h3 className="ras-section-eyebrow tracking-[0.12em]">{item.title}</h3>
                    <p className="ras-hero-body mt-3 text-sm">
                      {item.description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="ras-card relative aspect-[608/500] min-h-[18rem] overflow-hidden border-[var(--color-border-muted)]">
            <Image
              src={homeAssets.capabilities.map}
              alt="Global operations map"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
