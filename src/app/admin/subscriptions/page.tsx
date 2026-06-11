import { redirect } from "next/navigation";

/** Alias — canonical route is `/dashboard/admin/subscriptions`. */
export default function AdminSubscriptionsAliasPage() {
  redirect("/dashboard/admin/subscriptions");
}
