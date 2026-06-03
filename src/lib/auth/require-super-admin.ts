import { auth } from "@/auth";
import type { Session } from "next-auth";
import type { UserRole } from "@/types/roles";

export async function requireSuperAdminSession(): Promise<
  | { ok: true; session: Session; userId: string; role: UserRole }
  | { ok: false; status: 401 | 403; error: string }
> {
  const session = await auth();

  if (!session?.user?.id) {
    return { ok: false, status: 401, error: "Authentication required." };
  }

  const role = session.user.role as UserRole;
  if (role !== "super_admin") {
    return { ok: false, status: 403, error: "Super Admin access only." };
  }

  return { ok: true, session, userId: session.user.id, role };
}
