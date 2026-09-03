import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { PublicPageContainer } from "@/components/layout/PublicPageContainer";
import { PublicPilotProfile } from "@/components/pilots/PublicPilotProfile";
import { isPublicPilotProfileEnabled } from "@/lib/public-access";
import { getPublicPilotById } from "@/lib/pilot/public";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  if (!isPublicPilotProfileEnabled()) {
    return { title: "Pilot not found" };
  }

  const { id } = await params;
  const pilot = await getPublicPilotById(id);
  if (!pilot) return { title: "Pilot not found" };
  return {
    title: pilot.displayName,
    description: pilot.bio ?? `Drone pilot profile for ${pilot.displayName}.`,
  };
}

export default async function PublicPilotProfilePage({ params }: PageProps) {
  if (!isPublicPilotProfileEnabled()) {
    notFound();
  }

  const { id } = await params;
  const pilot = await getPublicPilotById(id);

  if (!pilot) {
    notFound();
  }

  const session = await auth();
  const isClient = session?.user?.role === "client";
  const messageHref = isClient
    ? "/dashboard/client/messages"
    : "/register?role=client";
  const hireHref = isClient
    ? "/dashboard/client/jobs/new"
    : "/register?role=client";

  return (
    <section className="figma-pilot-public-section figma-marketing-section pt-8 sm:pt-10">
      <PublicPageContainer>
        <Link
          href="/pilots"
          className="mb-8 inline-flex text-sm font-medium text-gold-light transition-colors hover:text-gold"
        >
          ← Back to all pilots
        </Link>
        <PublicPilotProfile
          pilot={pilot}
          messageHref={messageHref}
          hireHref={hireHref}
        />
      </PublicPageContainer>
    </section>
  );
}
