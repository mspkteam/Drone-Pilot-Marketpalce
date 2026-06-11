import Image from "next/image";
import { HOME_TRUST_ITEMS } from "@/lib/marketing/home-content";
import { homeAssets } from "@/lib/marketing/home-assets";

const TRUST_ICONS = [
  homeAssets.trust.verified,
  homeAssets.trust.faa,
  homeAssets.trust.payments,
] as const;

export function HomeTrustStrip() {
  return (
    <section
      className="border-b border-[var(--color-border-muted)] bg-[var(--color-bg-soft)] py-8"
      aria-label="Trust and compliance"
    >
      <div className="public-container">
        <ul className="grid gap-8 sm:grid-cols-3 sm:gap-6">
          {HOME_TRUST_ITEMS.map((item, index) => (
            <li key={item.title} className="flex items-start gap-4">
              <Image
                src={TRUST_ICONS[index]}
                alt=""
                width={24}
                height={32}
                className="h-7 w-6 shrink-0 object-contain"
                aria-hidden
              />
              <div>
                <p className="ras-section-eyebrow tracking-[0.1em]">{item.title}</p>
                <p className="mt-1 text-sm text-[var(--color-text-muted)]">{item.subtitle}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
