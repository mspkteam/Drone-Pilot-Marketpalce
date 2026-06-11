import { redirect } from "next/navigation";

/** Alias — canonical route is `/dashboard/admin/settings`. */
export default function AdminConfigurationAliasPage() {
  redirect("/dashboard/admin/settings");
}
