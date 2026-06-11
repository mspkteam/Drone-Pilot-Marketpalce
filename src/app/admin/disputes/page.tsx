import { redirect } from "next/navigation";

/** Alias — canonical disputes route is `/dashboard/admin/disputes`. */
export default function AdminDisputesAliasPage() {
  redirect("/dashboard/admin/disputes");
}
