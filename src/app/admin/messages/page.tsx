import { redirect } from "next/navigation";

/** Alias — canonical messages route is `/dashboard/admin/messages`. */
export default function AdminMessagesAliasPage() {
  redirect("/dashboard/admin/messages");
}
