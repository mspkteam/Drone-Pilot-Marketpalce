import { redirect } from "next/navigation";

/** Alias — canonical route is `/dashboard/pilot/settings`. */
export default function PilotSettingsAliasPage() {
  redirect("/dashboard/pilot/settings");
}
