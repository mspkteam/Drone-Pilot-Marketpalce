import { redirect } from "next/navigation";

/** Alias — canonical route is `/dashboard/pilot/contracts`. */
export default function PilotContractsAliasPage() {
  redirect("/dashboard/pilot/contracts");
}
