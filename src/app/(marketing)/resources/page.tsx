import { ResourcesArticleBrowse } from "@/components/marketing/resources/ResourcesArticleBrowse";
import { ResourcesHero } from "@/components/marketing/resources/ResourcesHero";
import { ResourcesWaitlistSection } from "@/components/marketing/resources/ResourcesWaitlistSection";

export const metadata = {
  title: "Resources — Remote Air Service",
  description:
    "Drone resources, hiring guides, regulations, pilot tips, safety advice, and industry insights from Remote Air Service.",
};

export default function ResourcesPage() {
  return (
    <>
      <ResourcesHero />
      <ResourcesArticleBrowse />
      <ResourcesWaitlistSection />
    </>
  );
}
