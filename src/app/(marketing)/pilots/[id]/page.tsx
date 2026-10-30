import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { PublicPageContainer } from "@/components/layout/PublicPageContainer";
import { PublicPilotProfile } from "@/components/pilots/PublicPilotProfile";
import { isPublicPilotProfileEnabled } from "@/lib/public-access";
import { getPublicPilotById } from "@/lib/pilot/public";
import {
  browsePilotsHref,
  canHirePilot,
  hireMarketplaceHref,
  normalizeHireViewerRole,
} from "@/lib/pilot/hire-cta";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  if (!isPublicPilotProfileEnabled()) {
    return { title: "Pilot not found" };
  }

  const { id } = await params;
  const session = await auth();
  const pilot = await getPublicPilotById(id, {
    viewerUserId: session?.user?.id,
  });
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
  const session = await auth();
  const pilot = await getPublicPilotById(id, {
    viewerUserId: session?.user?.id,
  });

  if (!pilot) {
    notFound();
  }

  const viewerRole = normalizeHireViewerRole(session?.user?.role);
  const showHire = canHirePilot(viewerRole);
  const hireHref =
    hireMarketplaceHref(viewerRole, id, pilot.displayName) ?? "/register?role=client";
  const browseHref = browsePilotsHref(viewerRole);
  const messageHref =
    viewerRole === "client"
      ? `/dashboard/client/messages?pilot=${encodeURIComponent(id)}`
      : "/register?role=client";

  return (
    <section className="figma-pilot-public-section figma-marketing-section pt-8 sm:pt-10">
      <PublicPageContainer>
        <Link
          href={browseHref}
          className="mb-8 inline-flex text-sm font-medium text-[#e4c55a] transition-colors hover:text-gold"
        >
          ← Back to all Pilots
        </Link>
        <PublicPilotProfile
          pilot={pilot}
          messageHref={messageHref}
          hireHref={hireHref}
          browseHref={browseHref}
          showHire={showHire}
        />
      </PublicPageContainer>
    </section>
  );
}
