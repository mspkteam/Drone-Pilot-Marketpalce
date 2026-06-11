import { redirect } from "next/navigation";

/** Alias — moderator uses the shared admin operations dashboard at `/dashboard/admin`. */
export default function ModeratorDashboardAliasPage() {
  redirect("/dashboard/admin");
}
