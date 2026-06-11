import { redirect } from "next/navigation";

/** Alias — canonical fleet & personnel route is `/dashboard/admin/users`. */
export default function AdminUsersAliasPage() {
  redirect("/dashboard/admin/users");
}
