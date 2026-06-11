import { redirect } from "next/navigation";

/** Alias route — canonical proposals page is `/dashboard/pilot/proposals`. */
export default function PilotProposalsAliasPage() {
  redirect("/dashboard/pilot/proposals");
}
