import { redirect } from "next/navigation";

/** Alias — canonical route is `/dashboard/admin/settings`. */
export default function DashboardAdminConfigurationAliasPage() {
  redirect("/dashboard/admin/settings");
}
