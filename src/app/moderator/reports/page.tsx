import { redirect } from "next/navigation";

/** Alias — moderator reports use the shared admin reports page. */
export default function ModeratorReportsAliasPage() {
  redirect("/dashboard/admin/reports");
}
