import Image from "next/image";
import { MarketingSectionLabel } from "@/components/marketing/figma/MarketingSectionLabel";
import { CLIENT_BENEFITS } from "@/lib/marketing/for-clients-content";
import { forClientsAssets } from "@/lib/marketing/for-clients-assets";

export function ClientBenefits() {
  return (
    <section className="figma-marketing-section overflow-x-clip" aria-label="Client benefits">
      <div className="public-container">
        <MarketingSectionLabel>Client Benefits</MarketingSectionLabel>
        <h2 className="ras-marketing-section-title mt-3 max-w-2xl">
          Why Clients Choose Us
        </h2>
        <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {CLIENT_BENEFITS.map((benefit) => (
            <li
              key={benefit}
              className="figma-marketing-benefit flex min-h-[4.125rem] items-center gap-3 px-[1.3125rem] py-5"
            >
              <Image
                src={forClientsAssets.benefitCheck}
                alt=""
                width={20}
                height={20}
                className="h-5 w-5 shrink-0 object-contain"
                aria-hidden
              />
              <span className="min-w-0 text-base leading-snug text-ras-heading">
                {benefit}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
