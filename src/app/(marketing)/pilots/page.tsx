import { FindPilotsDirectory } from "@/components/marketing/find-pilots/FindPilotsDirectory";
import { FindPilotsHero } from "@/components/marketing/find-pilots/FindPilotsHero";
import { listClientFindPilots } from "@/lib/client/find-pilots-server";
import "@/styles/find-pilots-marketing.css";
import "@/styles/client-find-pilots.css";

export const metadata = {
  title: "Find Pilots",
  description:
    "Browse approved, marketplace-verified drone pilots by location, services, and ratings.",
};

export default async function FindPilotsPage({
  searchParams,
}: {
  searchParams: Promise<{ region?: string }>;
}) {
  const params = await searchParams;
  const pilots = await listClientFindPilots();
  const initialRegion = params.region ? decodeURIComponent(params.region) : null;

  return (
    <main className="find-pilots-page">
      <FindPilotsHero />
      <FindPilotsDirectory pilots={pilots} initialRegion={initialRegion} />
    </main>
  );
}
