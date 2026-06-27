import { CaptainsClubDirectory } from "@/components/marketing/captains-club/CaptainsClubDirectory";
import { CaptainsClubHero } from "@/components/marketing/captains-club/CaptainsClubHero";
import { CaptainsClubStatsBar } from "@/components/marketing/captains-club/CaptainsClubStatsBar";
import { CaptainsClubValueProps } from "@/components/marketing/captains-club/CaptainsClubValueProps";
import { getCaptainsClubPageData } from "@/lib/pilot/captains-club-server";
import "@/styles/captains-club.css";

export const metadata = {
  title: "Captain's Club — Elite verified drone captains",
  description:
    "Browse A-6 Captains of Remote Air Service — professional, verified, and insured drone operators for enterprise missions.",
};

export default async function CaptainsClubPage({
  searchParams,
}: {
  searchParams: Promise<{ region?: string }>;
}) {
  const params = await searchParams;
  const { captains, stats, regions, specialties } = await getCaptainsClubPageData();
  const initialRegion = params.region
    ? decodeURIComponent(params.region)
    : null;

  return (
    <main className="captains-club-page">
      <CaptainsClubHero />
      <CaptainsClubStatsBar stats={stats} />
      <CaptainsClubDirectory
        captains={captains}
        regions={regions}
        specialties={specialties}
        initialRegion={initialRegion}
      />
      <CaptainsClubValueProps />
    </main>
  );
}
