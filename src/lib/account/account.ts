import { prisma } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { getUnreadCount } from "@/lib/notifications/notify";
import type { AccountDto } from "@/types/account";
import type { UserRole } from "@/types/roles";

export async function getAccountForUser(userId: string): Promise<AccountDto | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
    },
  });

  if (!user) return null;

  const unreadNotifications = await getUnreadCount(userId);

  return {
    id: user.id,
    email: user.email,
    role: user.role as UserRole,
    status: user.status,
    createdAt: user.createdAt.toISOString(),
    unreadNotifications,
  };
}

export async function changeUserPassword(
  userId: string,
  input: {
    currentPassword: string;
    newPassword: string;
  },
): Promise<{ ok: true } | { ok: false; error: string; status: 400 | 404 }> {
  const current = input.currentPassword;
  const next = input.newPassword.trim();

  if (!current) {
    return { ok: false, error: "Current password is required.", status: 400 };
  }
  if (next.length < 8) {
    return {
      ok: false,
      error: "New password must be at least 8 characters.",
      status: 400,
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { passwordHash: true },
  });

  if (!user) {
    return { ok: false, error: "Account not found.", status: 404 };
  }

  const valid = await verifyPassword(current, user.passwordHash);
  if (!valid) {
    return { ok: false, error: "Current password is incorrect.", status: 400 };
  }

  const passwordHash = await hashPassword(next);
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  });

  return { ok: true };
}
