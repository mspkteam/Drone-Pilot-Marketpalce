import { redirect } from "next/navigation";

/** Alias — canonical reports route is `/dashboard/admin/reports`. */
export default function AdminReportsAliasPage() {
  redirect("/dashboard/admin/reports");
}
