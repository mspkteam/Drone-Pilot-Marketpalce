import { listPublishedCmsArticles, listPublishedCmsResources } from "@/lib/cms/cms-store";
import { ResourcesArticleBrowse } from "@/components/marketing/resources/ResourcesArticleBrowse";
import { ResourcesHero } from "@/components/marketing/resources/ResourcesHero";
import { ResourcesWaitlistSection } from "@/components/marketing/resources/ResourcesWaitlistSection";

export const metadata = {
  title: "Resources — Remote Air Service",
  description:
    "Drone resources, hiring guides, regulations, pilot tips, safety advice, and industry insights from Remote Air Service.",
};

export default async function ResourcesPage() {
  const [articles, resources] = await Promise.all([
    listPublishedCmsArticles(),
    listPublishedCmsResources(),
  ]);

  return (
    <>
      <ResourcesHero />
      <ResourcesArticleBrowse cmsArticles={articles} cmsResources={resources} />
      <ResourcesWaitlistSection />
    </>
  );
}
