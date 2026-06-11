import Image from "next/image";
import { safetyAssets } from "@/lib/marketing/safety-assets";
import { SAFETY_CONFIDENCE_CHECKLIST } from "@/lib/marketing/safety-content";

export function SafetyCertification() {
  return (
    <section
      className="figma-safety-section figma-marketing-section border-t border-[rgba(255,255,255,0.05)]"
      aria-label="Certification and confidence"
    >
      <div className="public-container">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <h2 className="text-3xl font-extrabold leading-tight tracking-tight text-ras-text sm:text-[2.25rem]">
              Professional Drone Work Requires Proper Certification
            </h2>
            <p className="mt-5 text-base leading-[1.7] text-ras-muted">
              In the US, commercial pilots typically need an FAA Part 107
              certificate. Pilots may be asked to provide license or
              certification details based on their region and service type.
            </p>
            <h3 className="mt-10 text-lg font-bold text-ras-text">
              Helping Clients Hire with Confidence
            </h3>
            <ul className="mt-5 space-y-3">
              {SAFETY_CONFIDENCE_CHECKLIST.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-3 rounded-[10px] border border-ras-gold-subtle bg-ras-card px-4 py-3.5"
                >
                  <Image
                    src={safetyAssets.checklistShield}
                    alt=""
                    width={18}
                    height={18}
                    className="h-[18px] w-[18px] shrink-0 object-contain"
                    aria-hidden
                  />
                  <span className="text-sm font-medium text-ras-text">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative min-h-[20rem] overflow-hidden rounded-[10px] border border-gold sm:min-h-[24rem] lg:h-[746px] lg:min-h-[746px]">
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
