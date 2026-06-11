import { redirect } from "next/navigation";

/** Alias — canonical route is `/dashboard/pilot/payments`. */
export default function PilotPaymentsAliasPage() {
  redirect("/dashboard/pilot/payments");
}
