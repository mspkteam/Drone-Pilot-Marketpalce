import { redirect } from "next/navigation";

/** Alias — canonical route is `/dashboard/pilot/reviews`. */
export default function PilotReviewsAliasPage() {
  redirect("/dashboard/pilot/reviews");
}
