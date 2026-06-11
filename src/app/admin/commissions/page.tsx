import { redirect } from "next/navigation";

/** Alias — canonical route is `/dashboard/admin/payments`. */
export default function AdminCommissionsAliasPage() {
  redirect("/dashboard/admin/payments");
}
