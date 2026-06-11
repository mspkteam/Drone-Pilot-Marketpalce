import { redirect } from "next/navigation";

/** Alias — canonical route is `/dashboard/pilot/verifications`. */
export default function PilotVerificationsAliasPage() {
  redirect("/dashboard/pilot/verifications");
}
