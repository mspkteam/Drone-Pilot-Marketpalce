import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { DashboardPageLayout } from "@/components/dashboard";
import { PublicPilotProfile } from "@/components/pilots/PublicPilotProfile";
import { getPublicPilotById } from "@/lib/pilot/public";
import {
  browsePilotsHref,
  hireMarketplaceHref,
} from "@/lib/pilot/hire-cta";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();
  const pilot = await getPublicPilotById(id, {
    viewerUserId: session?.user?.id,
  });
  if (!pilot) return { title: "Pilot not found" };
  return { title: pilot.displayName };
}

export default async function ClientFindPilotProfilePage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "client") {
    redirect("/login");
  }

  const { id } = await params;
  const pilot = await getPublicPilotById(id, {
    viewerUserId: session.user.id,
  });
  if (!pilot) {
    notFound();
  }

  const hireHref =
    hireMarketplaceHref("client", id, pilot.displayName) ??
    "/dashboard/client/jobs/new";
  const browseHref = browsePilotsHref("client");

  return (
    <DashboardPageLayout className="client-find-pilots-shell">
      <section className="figma-pilot-public-section pt-2">
        <Link
          href={browseHref}
          className="mb-6 inline-flex text-sm font-medium text-[#e4c55a] transition-colors hover:text-gold"
        >
          ← Back to Find a Pilot
        </Link>
        <PublicPilotProfile
          pilot={pilot}
          messageHref={`/dashboard/client/messages?pilot=${encodeURIComponent(id)}`}
          hireHref={hireHref}
          browseHref={browseHref}
          showHire
        />
      </section>
    </DashboardPageLayout>
  );
}
