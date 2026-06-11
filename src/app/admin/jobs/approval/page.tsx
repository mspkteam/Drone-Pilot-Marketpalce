import { redirect } from "next/navigation";

/** Alias — canonical job approval queue is `/dashboard/admin/jobs`. */
export default function AdminJobApprovalAliasPage() {
  redirect("/dashboard/admin/jobs");
}
