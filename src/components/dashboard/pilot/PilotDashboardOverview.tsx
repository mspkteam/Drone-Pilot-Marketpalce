import { PilotDashboardActivityFeed } from "@/components/dashboard/pilot/PilotDashboardActivityFeed";
import { PilotDashboardHero } from "@/components/dashboard/pilot/PilotDashboardHero";
import { PilotDashboardLockedJobs } from "@/components/dashboard/pilot/PilotDashboardLockedJobs";
import { PilotDashboardProfileStrength } from "@/components/dashboard/pilot/PilotDashboardProfileStrength";
import { PilotDashboardRecommendedJobs } from "@/components/dashboard/pilot/PilotDashboardRecommendedJobs";
import { PilotDashboardReviews } from "@/components/dashboard/pilot/PilotDashboardReviews";
import { PilotDashboardStats } from "@/components/dashboard/pilot/PilotDashboardStats";
import type { PilotDashboardPageData } from "@/lib/pilot/dashboard-page-data";

type PilotDashboardOverviewProps = {
  data: PilotDashboardPageData;
};

export function PilotDashboardOverview({ data }: PilotDashboardOverviewProps) {
  return (
    <div className="pilot-dashboard-page">
      <PilotDashboardHero data={data} />
      <PilotDashboardStats stats={data.stats} />

      <div className="pilot-dashboard-main-grid">
        <div className="pilot-dashboard-main-left">
          <PilotDashboardRecommendedJobs
            jobs={data.recommendedJobs}
            usingMock={data.usingMockRecommendedJobs}
          />
          <PilotDashboardLockedJobs
            jobs={data.lockedJobs}
            usingMock={data.usingMockLockedJobs}
          />
          <PilotDashboardProfileStrength
            pct={data.profileStrength.pct}
            items={data.profileStrength.items}
          />
        </div>

        <div className="pilot-dashboard-main-right">
          <PilotDashboardReviews
            averageRating={data.reviews.averageRating}
            count={data.reviews.count}
            items={data.reviews.items}
            usingMock={data.reviews.usingMockReviews}
          />
          <PilotDashboardActivityFeed
            items={data.activity.items}
            usingMock={data.activity.usingMockActivity}
          />
        </div>
      </div>
    </div>
  );
}
