import { redirect } from "next/navigation";

/** Alias — canonical route is `/dashboard/admin/shop`. */
export default function AdminShopAliasPage() {
  redirect("/dashboard/admin/shop");
}
