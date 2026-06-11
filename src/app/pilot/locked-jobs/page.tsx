import { redirect } from "next/navigation";

/** Alias route — canonical locked jobs page is `/dashboard/pilot/locked-jobs`. */
export default function PilotLockedJobsAliasPage() {
  redirect("/dashboard/pilot/locked-jobs");
}
