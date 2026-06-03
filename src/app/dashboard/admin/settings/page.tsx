import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PageHeader } from "@/components/layout/PageHeader";
import { DEFAULT_COMMISSION_RATE } from "@/lib/commission/constants";
import { roleMeetsRequirement } from "@/lib/auth/permissions";
import { isAdminRole, type UserRole } from "@/types/roles";

export const metadata = { title: "Settings" };

export default async function AdminSettingsPage() {
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
        title="Settings"
        description="Site settings, commission rate, and platform configuration."
      />
      <div className="mt-8 max-w-2xl space-y-6">
        <section className="rounded-lg border border-border bg-surface-elevated p-5">
          <h2 className="font-semibold">Commission (Phase 1)</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Platform commission is fixed at{" "}
            <strong>{(DEFAULT_COMMISSION_RATE * 100).toFixed(0)}%</strong> of
            gross booking amount. Records are created automatically when a
            booking is marked completed. Configurable rates and Stripe payouts
            are planned for a later phase.
          </p>
        </section>
        <section className="rounded-lg border border-border bg-surface-elevated p-5">
          <h2 className="font-semibold">Branding & email</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Marketing pages use interim black/white/gold styling (ADR-009). Email
            delivery uses in-app notifications plus dev console logging until
            SMTP is configured.
          </p>
        </section>
        <section className="rounded-lg border border-border bg-surface-elevated p-5">
          <h2 className="font-semibold">User management</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Moderator and Super Admin accounts are created via database seed or
            direct user records — not public registration. Full user CRUD UI is
            deferred; use the Users page to audit accounts.
          </p>
        </section>
      </div>
    </>
  );
}
