import Image from "next/image";
import { aboutAssets } from "@/lib/marketing/about-assets";

export function AboutStory() {
  return (
    <section
      className="figma-about-section figma-marketing-section border-t border-[rgba(255,255,255,0.05)]"
      aria-label="Our story"
    >
      <div className="public-container">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="order-2 lg:order-1">
            <h2 className="text-3xl font-extrabold tracking-tight text-ras-text sm:text-[2.25rem]">
              Our Story
            </h2>
            <p className="mt-5 max-w-lg text-base leading-[1.7] text-ras-soft">
              Remote Air Service was created to bring more structure to the drone
              services industry. Instead of scattered hiring and unclear pilot
              quality, we are building a professional system where clients can
              hire with confidence and pilots can grow with recognition.
            </p>
          </div>
          <div className="relative order-1 min-h-[18rem] overflow-hidden rounded-[14px] border border-ras-gold-subtle sm:min-h-[22rem] lg:order-2 lg:min-h-[26rem]">
            <Image
              src={aboutAssets.storyImage}
              alt="Drone pilot operating a remote controller"
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
