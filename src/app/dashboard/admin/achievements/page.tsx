import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminWingsPanel } from "@/components/admin/AdminWingsPanel";
import { PageHeader } from "@/components/layout/PageHeader";
import { roleMeetsRequirement } from "@/lib/auth/permissions";
import { isAdminRole, type UserRole } from "@/types/roles";

export const metadata = { title: "Achievements / Wings" };

export default async function AdminAchievementsPage() {
  const session = await auth();
  const role = session?.user?.role as UserRole | undefined;
  if (!session?.user?.id || !role || !isAdminRole(role)) {
    redirect("/login");
  }
  if (!roleMeetsRequirement(role, "super_admin")) {
    redirect("/dashboard/admin");
  }

  return (
    <>
      <PageHeader
        title="Digital Wings"
        description="Define wings, configure auto-assign rules, and award pilots manually."
      />
      <div className="mt-8 max-w-4xl">
        <AdminWingsPanel />
      </div>
    </>
  );
}
