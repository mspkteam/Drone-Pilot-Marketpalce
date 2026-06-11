import { redirect } from "next/navigation";

/** Alias — canonical admin operations dashboard is `/dashboard/admin`. */
export default function AdminDashboardAliasPage() {
  redirect("/dashboard/admin");
}
