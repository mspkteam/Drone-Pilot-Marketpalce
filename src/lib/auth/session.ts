import { auth } from "@/auth";
import type { UserRole } from "@/types/roles";

export async function getCurrentSession() {
  return auth();
}

export async function requireSession() {
  const session = await auth();
  if (!session?.user) {
    return null;
  }
  return session;
}

export async function getCurrentUserRole(): Promise<UserRole | null> {
  const session = await auth();
  return (session?.user?.role as UserRole) ?? null;
}
