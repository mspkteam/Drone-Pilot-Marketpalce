import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PilotPortfolioView } from "@/components/dashboard/pilot/portfolio/PilotPortfolioView";
import { DashboardPageLayout } from "@/components/dashboard";
import "@/styles/pilot-portfolio.css";

export const metadata = { title: "Portfolio / Flight Gallery" };

export default async function PilotPortfolioPage() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "pilot") {
    redirect("/login");
  }

  return (
    <DashboardPageLayout className="pilot-portfolio-shell">
      <PilotPortfolioView />
    </DashboardPageLayout>
  );
}
