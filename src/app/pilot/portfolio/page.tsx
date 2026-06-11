import { redirect } from "next/navigation";

/** Alias — canonical route is `/dashboard/pilot/portfolio`. */
export default function PilotPortfolioAliasPage() {
  redirect("/dashboard/pilot/portfolio");
}
