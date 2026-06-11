import { redirect } from "next/navigation";

/** Legacy route — profile completion lives at `/dashboard/pilot/profile`. */
export default function PilotOnboardingPage() {
  redirect("/dashboard/pilot/profile");
}
