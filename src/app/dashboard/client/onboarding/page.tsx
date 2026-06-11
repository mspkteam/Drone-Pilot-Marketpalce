import { redirect } from "next/navigation";

/** Legacy route — profile completion lives at `/dashboard/client/profile`. */
export default function ClientOnboardingPage() {
  redirect("/dashboard/client/profile");
}
