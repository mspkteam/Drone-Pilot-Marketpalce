import { redirect } from "next/navigation";

type PageProps = { params: Promise<{ id: string }> };

export default async function AdminCmsEditResourceAliasPage({ params }: PageProps) {
  const { id } = await params;
  redirect(`/dashboard/admin/cms/resources/${id}/edit`);
}
