import { AboutAudience } from "@/components/marketing/about/AboutAudience";
import { AboutDifferentiators } from "@/components/marketing/about/AboutDifferentiators";
import { AboutHero } from "@/components/marketing/about/AboutHero";
import { AboutMission } from "@/components/marketing/about/AboutMission";
import { AboutPathCta } from "@/components/marketing/about/AboutPathCta";
import { AboutStory } from "@/components/marketing/about/AboutStory";

export const metadata = {
  title: "About — Remote Air Service",
  description:
    "Learn how Remote Air Service is building an aviation-inspired drone pilot marketplace for clients and professional pilots.",
};

export default function AboutPage() {
  return (
    <>
      <AboutHero />
      <AboutMission />
      <AboutStory />
      <AboutDifferentiators />
      <AboutAudience />
      <AboutPathCta />
    </>
  );
}
