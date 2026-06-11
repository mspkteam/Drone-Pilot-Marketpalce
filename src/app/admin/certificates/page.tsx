import { redirect } from "next/navigation";

/** Alias — canonical route is `/dashboard/admin/certificates`. */
export default function AdminCertificatesAliasPage() {
  redirect("/dashboard/admin/certificates");
}
