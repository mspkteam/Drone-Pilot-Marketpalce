import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminWaitlistPanel } from "@/components/admin/AdminWaitlistPanel";
import { PageHeader } from "@/components/layout/PageHeader";
import { countWaitlistSubscribers } from "@/lib/waitlist/waitlist";
import { isAdminRole, type UserRole } from "@/types/roles";

export const metadata = { title: "Waitlist" };

export default async function AdminWaitlistPage() {
  const session = await auth();
  const role = session?.user?.role as UserRole | undefined;
  if (!session?.user?.id || !role || !isAdminRole(role)) {
    redirect("/login");
  }

  const subscriberCount = await countWaitlistSubscribers();

  return (
    <>
      <PageHeader
        title="Waitlist"
        description="Pre-launch signups and launch funnel interest by role and region."
      />
      <p className="mt-4 text-sm text-muted-foreground">
        {subscriberCount} active subscriber{subscriberCount === 1 ? "" : "s"} on
        the waitlist.
      </p>
      <div className="mt-8 max-w-5xl">
        <AdminWaitlistPanel />
      </div>
    </>
  );
}
