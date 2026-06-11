import { redirect } from "next/navigation";

type PageProps = { params: Promise<{ id: string }> };

/** Alias — canonical dispute detail is `/dashboard/admin/disputes/[id]`. */
export default async function ModeratorDisputeDetailAliasPage({
  params,
}: PageProps) {
  const { id } = await params;
  redirect(`/dashboard/admin/disputes/${id}`);
}
