import { prisma } from "@/lib/db";
import type { AdminUserEditDto } from "@/types/admin-user-edit";
import { USER_ACCOUNT_STATUSES } from "@/types/admin-user-edit";
import type { UserRole } from "@/types/roles";
import { PILOT_PROFILE_STATUSES } from "@/types/pilot";
import { CLIENT_PROFILE_STATUSES } from "@/types/client";

export type { AdminUserEditDto } from "@/types/admin-user-edit";
export { USER_ACCOUNT_STATUSES } from "@/types/admin-user-edit";

export async function getUserForAdminEdit(
  userId: string,
): Promise<AdminUserEditDto | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      pilotProfile: {
        select: {
          id: true,
          displayName: true,
          licenseNumber: true,
          status: true,
          isPublic: true,
          bio: true,
          locationCity: true,
          locationRegion: true,
          locationCountry: true,
        },
      },
      clientProfile: {
        select: {
          id: true,
          contactName: true,
          companyName: true,
          phone: true,
          status: true,
        },
      },
    },
  });
  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    role: user.role as UserRole,
    status: user.status,
    moderationNote: user.moderationNote ?? null,
    createdAt: user.createdAt.toISOString(),
    pilot: user.pilotProfile
      ? {
          id: user.pilotProfile.id,
          displayName: user.pilotProfile.displayName,
          licenseNumber: user.pilotProfile.licenseNumber,
          status: user.pilotProfile.status,
          isPublic: user.pilotProfile.isPublic,
          bio: user.pilotProfile.bio,
          locationCity: user.pilotProfile.locationCity,
          locationRegion: user.pilotProfile.locationRegion,
          locationCountry: user.pilotProfile.locationCountry,
        }
      : null,
    client: user.clientProfile
      ? {
          id: user.clientProfile.id,
          contactName: user.clientProfile.contactName,
          companyName: user.clientProfile.companyName,
          phone: user.clientProfile.phone,
          status: user.clientProfile.status,
        }
      : null,
  };
}

export type AdminUserUpdateInput = {
  email?: string;
  status?: string;
  moderationNote?: string | null;
  pilot?: {
    displayName?: string;
    status?: string;
    isPublic?: boolean;
    bio?: string | null;
    locationCity?: string | null;
    locationRegion?: string | null;
    locationCountry?: string | null;
  };
  client?: {
    contactName?: string;
    companyName?: string | null;
    phone?: string | null;
    status?: string;
  };
};

export async function updateUserByAdmin(
  userId: string,
  input: AdminUserUpdateInput,
): Promise<
  | { ok: true; user: AdminUserEditDto }
  | { ok: false; error: string; status: 400 | 404 | 409 }
> {
  const existing = await prisma.user.findUnique({
    where: { id: userId },
    include: { pilotProfile: true, clientProfile: true },
  });
  if (!existing) {
    return { ok: false, error: "User not found.", status: 404 };
  }

  if (input.email !== undefined) {
    const email = input.email.trim().toLowerCase();
    if (!email || !email.includes("@")) {
      return { ok: false, error: "Valid email is required.", status: 400 };
    }
    const clash = await prisma.user.findFirst({
      where: { email, NOT: { id: userId } },
      select: { id: true },
    });
    if (clash) {
      return { ok: false, error: "Email already in use.", status: 409 };
    }
  }

  if (
    input.status !== undefined &&
    !(USER_ACCOUNT_STATUSES as readonly string[]).includes(input.status)
  ) {
    return { ok: false, error: "Invalid account status.", status: 400 };
  }

  if (input.pilot && existing.pilotProfile) {
    if (
      input.pilot.status !== undefined &&
      !(PILOT_PROFILE_STATUSES as readonly string[]).includes(input.pilot.status)
    ) {
      return { ok: false, error: "Invalid pilot profile status.", status: 400 };
    }
    if (input.pilot.displayName !== undefined && !input.pilot.displayName.trim()) {
      return { ok: false, error: "Display name is required.", status: 400 };
    }
  }

  if (input.client && existing.clientProfile) {
    if (
      input.client.status !== undefined &&
      !(CLIENT_PROFILE_STATUSES as readonly string[]).includes(input.client.status)
    ) {
      return { ok: false, error: "Invalid client profile status.", status: 400 };
    }
    if (
      input.client.contactName !== undefined &&
      !input.client.contactName.trim()
    ) {
      return { ok: false, error: "Contact name is required.", status: 400 };
    }
  }

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: {
        ...(input.email !== undefined
          ? { email: input.email.trim().toLowerCase() }
          : {}),
        ...(input.status !== undefined ? { status: input.status } : {}),
        ...(input.moderationNote !== undefined
          ? { moderationNote: input.moderationNote?.trim() || null }
          : {}),
      },
    });

    if (input.pilot && existing.pilotProfile) {
      const pilotStatus = input.pilot.status;
      const forcePrivate =
        pilotStatus === "pending_review" ||
        pilotStatus === "suspended" ||
        pilotStatus === "rejected";
      await tx.pilotProfile.update({
        where: { id: existing.pilotProfile.id },
        data: {
          ...(input.pilot.displayName !== undefined
            ? { displayName: input.pilot.displayName.trim() }
            : {}),
          ...(input.pilot.status !== undefined
            ? { status: input.pilot.status }
            : {}),
          ...(input.pilot.isPublic !== undefined || forcePrivate
            ? {
                isPublic: forcePrivate
                  ? false
                  : (input.pilot.isPublic ?? existing.pilotProfile.isPublic),
              }
            : {}),
          ...(input.pilot.bio !== undefined
            ? { bio: input.pilot.bio?.trim() || null }
            : {}),
          ...(input.pilot.locationCity !== undefined
            ? { locationCity: input.pilot.locationCity?.trim() || null }
            : {}),
          ...(input.pilot.locationRegion !== undefined
            ? { locationRegion: input.pilot.locationRegion?.trim() || null }
            : {}),
          ...(input.pilot.locationCountry !== undefined
            ? { locationCountry: input.pilot.locationCountry?.trim() || null }
            : {}),
        },
      });
    }

    if (input.client && existing.clientProfile) {
      await tx.clientProfile.update({
        where: { id: existing.clientProfile.id },
        data: {
          ...(input.client.contactName !== undefined
            ? { contactName: input.client.contactName.trim() }
            : {}),
          ...(input.client.companyName !== undefined
            ? { companyName: input.client.companyName?.trim() || null }
            : {}),
          ...(input.client.phone !== undefined
            ? { phone: input.client.phone?.trim() || null }
            : {}),
          ...(input.client.status !== undefined
            ? { status: input.client.status }
            : {}),
        },
      });
    }
  });

  const updated = await getUserForAdminEdit(userId);
  if (!updated) {
    return { ok: false, error: "User not found after update.", status: 404 };
  }
  return { ok: true, user: updated };
}
