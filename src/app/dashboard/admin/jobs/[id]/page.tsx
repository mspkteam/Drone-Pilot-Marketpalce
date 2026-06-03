import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminJobReview } from "@/components/admin/AdminJobReview";
import { PageHeader } from "@/components/layout/PageHeader";
import { getJobForAdmin } from "@/lib/jobs/admin";
import { isAdminRole, type UserRole } from "@/types/roles";

export const metadata = { title: "Review job" };

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminJobReviewPage({ params }: PageProps) {
  const session = await auth();
  const role = session?.user?.role as UserRole | undefined;
  if (!session?.user?.id || !role || !isAdminRole(role)) {
    redirect("/login");
  }

  const { id } = await params;
  const job = await getJobForAdmin(id);
  if (!job) {
    notFound();
  }

  return (
    <>
      <PageHeader title="Review job" description="Moderate this job posting." />
      <div className="mt-8 max-w-3xl">
        <AdminJobReview job={job} />
      </div>
    </>
  );
}
