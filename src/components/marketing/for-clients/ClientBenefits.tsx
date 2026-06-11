import Image from "next/image";
import { MarketingSectionLabel } from "@/components/marketing/figma/MarketingSectionLabel";
import { CLIENT_BENEFITS } from "@/lib/marketing/for-clients-content";
import { forClientsAssets } from "@/lib/marketing/for-clients-assets";

export function ClientBenefits() {
  return (
    <section className="figma-marketing-section" aria-label="Client benefits">
      <div className="public-container">
        <MarketingSectionLabel>Client Benefits</MarketingSectionLabel>
        <h2 className="mt-3 max-w-2xl text-3xl font-bold tracking-tight text-ras-heading sm:text-4xl">
          Why Clients Choose Us
        </h2>
        <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {CLIENT_BENEFITS.map((benefit) => (
            <li
              key={benefit}
              className="figma-marketing-benefit flex items-center gap-3 rounded-[14px] border border-[rgba(212,175,55,0.1)] bg-ras-card p-5"
            >
              <Image
                src={forClientsAssets.benefitShield}
                alt=""
                width={20}
                height={20}
                className="mt-0.5 h-5 w-5 shrink-0 object-contain"
                aria-hidden
              />
              <span className="text-base text-ras-heading">{benefit}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
