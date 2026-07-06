import Image from "next/image";
import { safetyAssets } from "@/lib/marketing/safety-assets";
import { SAFETY_CONFIDENCE_CHECKLIST } from "@/lib/marketing/safety-content";

export function SafetyCertification() {
  return (
    <section
      className="figma-safety-section figma-marketing-section"
      aria-label="Certification and confidence"
    >
      <div className="public-container">
        <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-5">
          <div className="max-w-[39.375rem]">
            <h2 className="ras-marketing-section-title">
              Professional Drone Work Requires Proper Certification
            </h2>
            <p className="mt-5 text-lg leading-[1.62] text-ras-warm">
              In the US, commercial pilots typically need an FAA Part 107
              certificate. Pilots may be asked to provide license or
              certification details based on their region and service type.
            </p>
            <h3 className="mt-10 text-xl font-semibold tracking-tight text-ras-heading">
              Helping Clients Hire with Confidence
            </h3>
            <ul className="mt-5 space-y-3">
              {SAFETY_CONFIDENCE_CHECKLIST.map((item) => (
                <li key={item} className="ras-safety-checklist-row">
                  <Image
                    src={safetyAssets.checklistShield}
                    alt=""
                    width={20}
                    height={20}
                    className="h-5 w-5 shrink-0 object-contain"
                    aria-hidden
                  />
                  <span className="text-base text-ras-heading">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative min-h-[20rem] overflow-hidden rounded-[14px] border border-gold lg:min-h-[46.625rem]">
            <Image
              src={safetyAssets.certificationImage}
              alt="Drone pilot operating a commercial UAV"
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
