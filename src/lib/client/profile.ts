import { prisma } from "@/lib/db";
import type { ClientProfile } from "@/generated/prisma/client";
import type {
  ClientBillingAddress,
  ClientProfileDto,
  ClientProfileStatus,
} from "@/types/client";

export function parseBillingAddress(json: string | null): ClientBillingAddress | null {
  if (!json) return null;
  try {
    const parsed = JSON.parse(json) as unknown;
    if (!parsed || typeof parsed !== "object") return null;
    return parsed as ClientBillingAddress;
  } catch {
    return null;
  }
}

export function serializeBillingAddress(
  address: ClientBillingAddress | null | undefined,
): string | null {
  if (!address) return null;
  const hasValue = Object.values(address).some(
    (v) => typeof v === "string" && v.trim().length > 0,
  );
  if (!hasValue) return null;
  return JSON.stringify(address);
}

export function toClientProfileDto(profile: ClientProfile): ClientProfileDto {
  return {
    id: profile.id,
    userId: profile.userId,
    companyName: profile.companyName,
    contactName: profile.contactName,
    phone: profile.phone,
    billingAddress: parseBillingAddress(profile.billingAddress),
    status: profile.status as ClientProfileStatus,
    onboardingCompletedAt:
      profile.onboardingCompletedAt?.toISOString() ?? null,
    createdAt: profile.createdAt.toISOString(),
    updatedAt: profile.updatedAt.toISOString(),
  };
}

export async function getClientProfileByUserId(userId: string) {
  return prisma.clientProfile.findUnique({ where: { userId } });
}

export function isOnboardingComplete(profile: ClientProfile | null): boolean {
  return !!profile?.onboardingCompletedAt;
}
