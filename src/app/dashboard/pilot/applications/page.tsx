import { redirect } from "next/navigation";

type PageProps = {
  searchParams: Promise<{ submitted?: string }>;
};

/** Legacy route — redirects to `/dashboard/pilot/proposals`. */
export default async function PilotApplicationsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const query = params.submitted === "1" ? "?submitted=1" : "";
  redirect(`/dashboard/pilot/proposals${query}`);
}
