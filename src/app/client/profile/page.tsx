import { redirect } from "next/navigation";

/** Alias — canonical route is `/dashboard/client/profile`. */
export default function ClientProfileAliasPage() {
  redirect("/dashboard/client/profile");
}
