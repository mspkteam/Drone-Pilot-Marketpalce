import { redirect } from "next/navigation";

/** Alias — canonical route is `/dashboard/admin/achievements`. */
export default function AdminBadgesAliasPage() {
  redirect("/dashboard/admin/achievements");
}
