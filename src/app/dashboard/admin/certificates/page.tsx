import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminCertificatesPanel } from "@/components/admin/AdminCertificatesPanel";
import { PageHeader } from "@/components/layout/PageHeader";
import { isAdminRole, type UserRole } from "@/types/roles";

export const metadata = { title: "Certificates" };

export default async function AdminCertificatesPage() {
  const session = await auth();
  const role = session?.user?.role as UserRole | undefined;
  if (!session?.user?.id || !role || !isAdminRole(role)) {
    redirect("/login");
  }

  return (
    <>
      <PageHeader
        title="Certificates"
        description="Create templates, issue PDF certificates to pilots, and audit issued records."
      />
      <div className="mt-8 w-full">
        <AdminCertificatesPanel />
      </div>
    </>
  );
}
