import { hash } from "bcryptjs";
import { buildPresetPermissions } from "@/lib/auth/moderator-permissions";
import { prisma } from "@/lib/db";
import type { AdminUserDto } from "@/types/admin";
import {
  isManagementUserRole,
  type ManagementUserRole,
} from "@/types/roles";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type CreateManagementUserInput = {
  email: string;
  password: string;
  role: ManagementUserRole;
};

export type ManagementUserResult =
  | { ok: true; user: AdminUserDto }
  | { ok: false; error: string; status: 400 | 409 | 404 | 403 };

function toAdminUserDto(user: {
  id: string;
  email: string;
  role: string;
  status: string;
  createdAt: Date;
}): AdminUserDto {
  return {
    id: user.id,
    email: user.email,
    role: user.role as AdminUserDto["role"],
    status: user.status,
    createdAt: user.createdAt.toISOString(),
    pilotProfileId: null,
    clientProfileId: null,
  };
}

export async function createManagementUser(
  input: CreateManagementUserInput,
): Promise<ManagementUserResult> {
  const email = input.email.trim().toLowerCase();
  const password = input.password;
  const role = input.role;

  if (!EMAIL_RE.test(email)) {
    return { ok: false, error: "Enter a valid email address.", status: 400 };
  }
  if (password.length < 8) {
    return {
      ok: false,
      error: "Password must be at least 8 characters.",
      status: 400,
    };
  }
  if (!isManagementUserRole(role)) {
    return {
      ok: false,
      error: "Role must be Admin or Moderator.",
      status: 400,
    };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return {
      ok: false,
      error: "A user with this email already exists.",
      status: 409,
    };
  }

  const passwordHash = await hash(password, 12);
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      role,
      status: "active",
    },
  });

  // New moderators start with full operational access; Super Admin can set Limited later.
  const preset = "full";
  await prisma.moderatorPermissionRecord.create({
    data: {
      userId: user.id,
      preset,
      permissionsJson: JSON.stringify(buildPresetPermissions(preset)),
    },
  });

  return { ok: true, user: toAdminUserDto(user) };
}

export type DeleteManagementUserResult =
  | { ok: true; deletedId: string }
  | { ok: false; error: string; status: 400 | 409 | 404 | 403 };

export async function deleteManagementUser(
  targetUserId: string,
  actorUserId: string,
): Promise<DeleteManagementUserResult> {
  if (targetUserId === actorUserId) {
    return {
      ok: false,
      error: "You cannot delete your own account.",
      status: 403,
    };
  }

  const target = await prisma.user.findUnique({ where: { id: targetUserId } });
  if (!target) {
    return { ok: false, error: "User not found.", status: 404 };
  }

  if (!isManagementUserRole(target.role)) {
    return {
      ok: false,
      error: "Only Admin and Moderator accounts can be deleted here.",
      status: 400,
    };
  }

  await prisma.$transaction(async (tx) => {
    await tx.moderatorPermissionRecord.deleteMany({
      where: { userId: targetUserId },
    });
    await tx.user.delete({ where: { id: targetUserId } });
  });

  return { ok: true, deletedId: targetUserId };
}
