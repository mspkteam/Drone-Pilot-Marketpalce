import { redirect } from "next/navigation";

/** Alias — canonical route is `/dashboard/admin/cms`. */
export default function AdminCmsAliasPage() {
  redirect("/dashboard/admin/cms");
}
