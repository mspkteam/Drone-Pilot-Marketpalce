import { HomeAudienceCards } from "@/components/marketing/home/HomeAudienceCards";
import { HomeCapabilities } from "@/components/marketing/home/HomeCapabilities";
import { HomeCaptainsClub } from "@/components/marketing/home/HomeCaptainsClub";
import { HomeHeroDual } from "@/components/marketing/home/HomeHeroDual";
import { HomeRankProgression } from "@/components/marketing/home/HomeRankProgression";
import { HomeSopSection } from "@/components/marketing/home/HomeSopSection";
import { HomeTrustStrip } from "@/components/marketing/home/HomeTrustStrip";
import { HomePathCta } from "@/components/marketing/home/HomePathCta";

export const metadata = {
  title: "Drone Pilot Marketplace — Hire pilots or join the network",
  description:
    "Find local licensed drone pilots for enterprise missions, or join the pilot network and get paid flying missions.",
};

export default function HomePage() {
  return (
    <>
      <HomeHeroDual />
      <HomeTrustStrip />
      <HomeAudienceCards />
      <HomeSopSection />
      <HomeRankProgression />
      <HomeCaptainsClub />
      <HomeCapabilities />
      <HomePathCta />
    </>
  );
}
