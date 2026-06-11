import { redirect } from "next/navigation";

/** Alias route — canonical marketplace is `/dashboard/pilot/jobs`. */
export default function PilotJobsAliasPage() {
  redirect("/dashboard/pilot/jobs");
}
