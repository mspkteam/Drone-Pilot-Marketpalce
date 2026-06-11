import { redirect } from "next/navigation";

/** Alias — canonical route is `/dashboard/admin/settings`. */
export default function AdminSettingsAliasPage() {
  redirect("/dashboard/admin/settings");
}
