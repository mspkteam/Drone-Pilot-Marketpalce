import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { DashboardPageLayout } from "@/components/dashboard";
import { PilotInstructorStudentsView } from "@/components/dashboard/pilot/instructor/PilotInstructorStudentsView";
import {
  getPilotProfileByUserId,
  isOnboardingComplete,
} from "@/lib/pilot/profile";
import "@/styles/pilot-instructor.css";

export const metadata = { title: "Students" };

export default async function PilotStudentsPage() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "pilot") {
    redirect("/login");
  }

  const profile = await getPilotProfileByUserId(session.user.id);
  if (!isOnboardingComplete(profile)) {
    redirect("/dashboard/pilot/profile");
  }
  if (!profile?.instructorAddonActive) {
    redirect("/dashboard/pilot/instructor");
  }

  return (
    <DashboardPageLayout className="pilot-instructor-shell">
      <PilotInstructorStudentsView />
    </DashboardPageLayout>
  );
}
