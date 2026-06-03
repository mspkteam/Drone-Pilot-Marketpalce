import { DashboardShell } from "@/components/layout/DashboardShell";
import { adminNav } from "@/lib/navigation/admin";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardShell roleLabel="Admin Dashboard" navItems={adminNav}>
      {children}
    </DashboardShell>
  );
}
