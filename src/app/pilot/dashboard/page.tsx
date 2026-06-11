import { redirect } from "next/navigation";

/** Alias route — canonical pilot dashboard is `/dashboard/pilot`. */
export default function PilotDashboardAliasPage() {
  redirect("/dashboard/pilot");
}
