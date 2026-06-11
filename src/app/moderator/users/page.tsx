import { redirect } from "next/navigation";

/** Alias — moderator personnel uses the shared admin users page. */
export default function ModeratorUsersAliasPage() {
  redirect("/dashboard/admin/users");
}
