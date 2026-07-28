import { redirect } from "next/navigation";

export const metadata = { title: "Clients" };

/** Legacy route — clients are managed in Fleet & Personnel. */
export default function AdminClientsPage() {
  redirect("/dashboard/admin/users?role=client");
}
