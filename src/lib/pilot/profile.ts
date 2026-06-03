import { prisma } from "@/lib/db";
import type { PilotProfile } from "@/generated/prisma/client";
import type {
  PilotProfileDto,
  PilotProfileStatus,
  PilotServiceId,
} from "@/types/pilot";

export function parseServicesOffered(json: string): PilotServiceId[] {
  try {
    const parsed = JSON.parse(json) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((s): s is PilotServiceId => typeof s === "string");
  } catch {
    return [];
  }
}

export function serializeServicesOffered(services: string[]): string {
  return JSON.stringify(services);
}

export function toPilotProfileDto(profile: PilotProfile): PilotProfileDto {
  return {
    id: profile.id,
    userId: profile.userId,
    displayName: profile.displayName,
    bio: profile.bio,
    locationCity: profile.locationCity,
    locationRegion: profile.locationRegion,
    locationCountry: profile.locationCountry,
    serviceRadiusKm: profile.serviceRadiusKm,
    servicesOffered: parseServicesOffered(profile.servicesOffered),
    hourlyRateMin: profile.hourlyRateMin,
    hourlyRateMax: profile.hourlyRateMax,
    licenseNumber: profile.licenseNumber,
    licenseCountry: profile.licenseCountry,
    isPublic: profile.isPublic,
    status: profile.status as PilotProfileStatus,
    complianceAcceptedAt: profile.complianceAcceptedAt?.toISOString() ?? null,
    onboardingCompletedAt:
      profile.onboardingCompletedAt?.toISOString() ?? null,
    createdAt: profile.createdAt.toISOString(),
    updatedAt: profile.updatedAt.toISOString(),
  };
}

export async function getPilotProfileByUserId(userId: string) {
  return prisma.pilotProfile.findUnique({ where: { userId } });
}

export function isOnboardingComplete(profile: PilotProfile | null): boolean {
  return !!profile?.onboardingCompletedAt;
}
