import { redirect } from "next/navigation";

/** Alias — moderator job approval uses the shared admin jobs queue. */
export default function ModeratorJobApprovalAliasPage() {
  redirect("/dashboard/admin/jobs");
}
