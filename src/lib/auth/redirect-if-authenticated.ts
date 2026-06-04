import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getDashboardHomeForRole } from "@/lib/auth/permissions";
import { getAuthSecret } from "@/lib/auth/secret";
import type { UserRole } from "@/types/roles";

/** Send logged-in users away from /login and /register (Node server, not Edge middleware). */
export async function redirectIfAuthenticated() {
  if (!getAuthSecret()) return;

  const session = await auth();
  const role = session?.user?.role as UserRole | undefined;
  if (session?.user && role) {
    redirect(getDashboardHomeForRole(role));
  }
}
