import { redirect } from "next/navigation";

/** Alias — canonical route is `/dashboard/pilot/shop`. */
export default function PilotShopAliasPage() {
  redirect("/dashboard/pilot/shop");
}
