import { auth } from "@/auth";
import { isAdminRole, type UserRole } from "@/types/roles";
import type { Session } from "next-auth";

export async function requireAdminSession(): Promise<
  | { ok: true; session: Session; userId: string; role: UserRole }
  | { ok: false; status: 401 | 403; error: string }
> {
  const session = await auth();

  if (!session?.user?.id) {
    return { ok: false, status: 401, error: "Authentication required." };
  }

  const role = session.user.role as UserRole;
  if (!isAdminRole(role)) {
    return { ok: false, status: 403, error: "Admin access only." };
  }

  return { ok: true, session, userId: session.user.id, role };
}
