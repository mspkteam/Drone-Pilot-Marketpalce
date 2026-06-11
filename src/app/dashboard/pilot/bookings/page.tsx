import { redirect } from "next/navigation";

/** Legacy route — redirects to `/dashboard/pilot/contracts`. */
export default function PilotBookingsPage() {
  redirect("/dashboard/pilot/contracts");
}
