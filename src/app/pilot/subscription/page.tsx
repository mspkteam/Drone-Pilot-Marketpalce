import { redirect } from "next/navigation";

/** Alias — canonical route is `/dashboard/pilot/subscription`. */
export default function PilotSubscriptionAliasPage() {
  redirect("/dashboard/pilot/subscription");
}
