import { ClientDashboardRecommendedPilots } from "@/components/dashboard/client/ClientDashboardRecommendedPilots";
import { ClientDashboardRecentActivity } from "@/components/dashboard/client/ClientDashboardRecentActivity";
import { ClientDashboardRecentProjects } from "@/components/dashboard/client/ClientDashboardRecentProjects";
import { ClientDashboardStats } from "@/components/dashboard/client/ClientDashboardStats";
import { ClientDashboardWelcome } from "@/components/dashboard/client/ClientDashboardWelcome";
import type { ClientDashboardOverviewData } from "@/lib/client/dashboard-overview";

type ClientDashboardOverviewProps = ClientDashboardOverviewData;

export function ClientDashboardOverview({
  clientName,
  stats,
  recentProjects,
  recentActivity,
  recommendedPilots,
}: ClientDashboardOverviewProps) {
  return (
    <div className="client-dashboard-page">
      <ClientDashboardWelcome clientName={clientName} />
      <ClientDashboardStats stats={stats} />

      <div className="client-dashboard-middle-grid">
        <ClientDashboardRecentProjects projects={recentProjects} />
        <ClientDashboardRecentActivity activity={recentActivity} />
      </div>

      <ClientDashboardRecommendedPilots pilots={recommendedPilots} />
    </div>
  );
}
