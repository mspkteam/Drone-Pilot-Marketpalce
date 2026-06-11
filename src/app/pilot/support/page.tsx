import { redirect } from "next/navigation";

/** Alias — canonical route is `/dashboard/pilot/support`. */
export default function PilotSupportAliasPage() {
  redirect("/dashboard/pilot/support");
}
