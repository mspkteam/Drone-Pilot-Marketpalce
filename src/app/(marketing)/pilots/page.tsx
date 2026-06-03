import { PublicPilotCard } from "@/components/pilots/PublicPilotCard";
import { MarketingPage } from "@/components/layout/MarketingPage";
import { listPublicPilots } from "@/lib/pilot/public";

export const metadata = {
  title: "Find Pilots",
  description: "Browse approved drone pilots on the marketplace.",
};

export default async function PilotsDirectoryPage() {
  const pilots = await listPublicPilots();

  return (
    <MarketingPage
      title="Find pilots"
      description="Browse approved, marketplace-verified drone pilots by location, services, and ratings."
    >
      {pilots.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-12 text-center">
          <p className="text-muted-foreground">
            No public pilot profiles yet. Check back soon or{" "}
            <a href="/for-pilots" className="text-gold-dark hover:text-gold">
              join as a pilot
            </a>
            .
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {pilots.map((pilot) => (
            <PublicPilotCard key={pilot.id} pilot={pilot} />
          ))}
        </div>
      )}
    </MarketingPage>
  );
}
