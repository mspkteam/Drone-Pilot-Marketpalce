import { notFound } from "next/navigation";
import { PublicPilotProfile } from "@/components/pilots/PublicPilotProfile";
import { MarketingPage } from "@/components/layout/MarketingPage";
import { getPublicPilotById } from "@/lib/pilot/public";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const pilot = await getPublicPilotById(id);
  if (!pilot) return { title: "Pilot not found" };
  return {
    title: pilot.displayName,
    description: pilot.bio ?? `Drone pilot profile for ${pilot.displayName}.`,
  };
}

export default async function PublicPilotProfilePage({ params }: PageProps) {
  const { id } = await params;
  const pilot = await getPublicPilotById(id);

  if (!pilot) {
    notFound();
  }

  return (
    <MarketingPage
      title={pilot.displayName}
      description="Licensed drone pilot on Drone Pilot Marketplace."
      narrow
    >
      <PublicPilotProfile pilot={pilot} />
    </MarketingPage>
  );
}
