import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicPageContainer } from "@/components/layout/PublicPageContainer";
import { PublicPilotProfile } from "@/components/pilots/PublicPilotProfile";
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
    <section className="figma-pilot-public-section figma-marketing-section pt-8 sm:pt-10">
      <PublicPageContainer>
        <Link
          href="/pilots"
          className="mb-8 inline-flex text-sm font-medium text-gold-light transition-colors hover:text-gold"
        >
          ← Back to all pilots
        </Link>
        <PublicPilotProfile pilot={pilot} />
      </PublicPageContainer>
    </section>
  );
}
