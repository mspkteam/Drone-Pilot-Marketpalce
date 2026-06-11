import { redirect } from "next/navigation";

/** Alias — canonical route is `/dashboard/pilot/profile`. */
export default function PilotProfileAliasPage() {
  redirect("/dashboard/pilot/profile");
}
