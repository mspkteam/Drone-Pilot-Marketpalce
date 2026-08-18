import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PilotInstructorDashboard } from "@/components/dashboard/pilot/instructor/PilotInstructorDashboard";
import { DashboardPageLayout } from "@/components/dashboard";
import {
  getPilotProfileByUserId,
  isOnboardingComplete,
} from "@/lib/pilot/profile";
import "@/styles/pilot-instructor.css";

export const metadata = { title: "Instructor Membership" };

export default async function PilotInstructorPage() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "pilot") {
    redirect("/login");
  }

  const profile = await getPilotProfileByUserId(session.user.id);
  if (!isOnboardingComplete(profile)) {
    redirect("/dashboard/pilot/onboarding");
  }

  return (
    <DashboardPageLayout className="pilot-instructor-shell">
      <PilotInstructorDashboard />
    </DashboardPageLayout>
  );
}
