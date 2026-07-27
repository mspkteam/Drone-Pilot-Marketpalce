import { redirect } from "next/navigation";

export const metadata = { title: "Pilots" };

/** Legacy route — pilots are managed in Fleet & Personnel. */
export default function AdminPilotsPage() {
  redirect("/dashboard/admin/users?role=pilot");
}
