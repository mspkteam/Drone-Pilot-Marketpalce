import { ClientDashboardRecommendedPilots } from "@/components/dashboard/client/ClientDashboardRecommendedPilots";
import { ClientDashboardRecentActivity } from "@/components/dashboard/client/ClientDashboardRecentActivity";
import { ClientDashboardRecentProjects } from "@/components/dashboard/client/ClientDashboardRecentProjects";
import { ClientDashboardStats } from "@/components/dashboard/client/ClientDashboardStats";
import { ClientDashboardWelcome } from "@/components/dashboard/client/ClientDashboardWelcome";

type ClientDashboardOverviewProps = {
  clientName: string;
};

export function ClientDashboardOverview({
  clientName,
}: ClientDashboardOverviewProps) {
  return (
    <div className="client-dashboard-page">
      <ClientDashboardWelcome clientName={clientName} />
      <ClientDashboardStats />

      <div className="client-dashboard-middle-grid">
        <ClientDashboardRecentProjects />
        <ClientDashboardRecentActivity />
      </div>

      <ClientDashboardRecommendedPilots />
    </div>
  );
}
