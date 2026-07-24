import { prisma } from "@/lib/db";
import { toMembershipTierDto } from "@/lib/membership/membership";
import type { AdminUserEditDto } from "@/types/admin-user-edit";
import type { UserRole } from "@/types/roles";

export type AdminMemberDetailDto = {
  account: AdminUserEditDto;
  displayName: string;
  roleLabel: string;
  pilotDetail: {
    profileId: string;
    displayName: string;
    licenseNumber: string;
    licenseCountry: string | null;
    status: string;
    isPublic: boolean;
    bio: string | null;
    locationCity: string | null;
    locationRegion: string | null;
    locationCountry: string | null;
    serviceRadiusKm: number | null;
    hourlyRateMin: number | null;
    hourlyRateMax: number | null;
    onboardingCompletedAt: string | null;
    membership: {
      tierName: string;
      tierCode: string;
      status: string;
      canApply: boolean;
      instructorEligible: boolean;
      jobVisibilityDelayHours: number;
      periodEnd: string | null;
    } | null;
    wings: Array<{
      id: string;
      code: string;
      title: string;
      earnedAt: string;
    }>;
    counts: {
      applications: number;
      bookings: number;
      certificates: number;
      reviews: number;
    };
    recentApplications: Array<{
      id: string;
      jobTitle: string;
      status: string;
      proposedAmount: number;
      currency: string;
      submittedAt: string;
    }>;
  } | null;
  clientDetail: {
    profileId: string;
    contactName: string;
    companyName: string | null;
    phone: string | null;
    billingAddress: string | null;
    status: string;
    onboardingCompletedAt: string | null;
    counts: {
      jobs: number;
      bookings: number;
      reviews: number;
    };
    recentJobs: Array<{
      id: string;
      title: string;
      status: string;
      locationLabel: string;
      createdAt: string;
    }>;
  } | null;
};

export async function getMemberDetailForAdmin(
  userId: string,
): Promise<AdminMemberDetailDto | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      pilotProfile: {
        include: {
          subscriptions: {
            where: { status: { in: ["active", "trialing"] } },
            include: { subscriptionPlan: true },
            orderBy: { createdAt: "desc" },
            take: 1,
          },
          wings: {
            include: { wingDefinition: true },
            orderBy: { earnedAt: "desc" },
            take: 12,
          },
          applications: {
            include: { job: { select: { title: true } } },
            orderBy: { submittedAt: "desc" },
            take: 8,
          },
          _count: {
            select: {
              applications: true,
              bookings: true,
              certificates: true,
              reviewsReceived: true,
            },
          },
        },
      },
      clientProfile: {
        include: {
          jobs: {
            orderBy: { createdAt: "desc" },
            take: 8,
            select: {
              id: true,
              title: true,
              status: true,
              locationLabel: true,
              createdAt: true,
            },
          },
          _count: {
            select: {
              jobs: true,
              bookings: true,
              reviewsReceived: true,
            },
          },
        },
      },
    },
  });

  if (!user) return null;

  // Staff accounts are managed separately — not in the member directory.
  if (
    user.role === "moderator" ||
    user.role === "admin" ||
    user.role === "super_admin"
  ) {
    return null;
  }

  const pilot = user.pilotProfile;
  const client = user.clientProfile;
  const sub = pilot?.subscriptions[0] ?? null;
  const tier = sub ? toMembershipTierDto(sub.subscriptionPlan) : null;

  const displayName =
    pilot?.displayName ??
    client?.companyName ??
    client?.contactName ??
    user.email;

  const roleLabel = pilot
    ? tier?.code === "A5_FIRST_OFFICER" || tier?.code === "A6_CAPTAIN"
      ? "Elite Pilot"
      : tier?.instructorEligible
        ? "Squadron Lead"
        : "Pilot"
    : client?.companyName?.trim()
      ? "Enterprise Client"
      : "Client";

  const account: AdminUserEditDto = {
    id: user.id,
    email: user.email,
    role: user.role as UserRole,
    status: user.status,
    moderationNote: user.moderationNote ?? null,
    createdAt: user.createdAt.toISOString(),
    pilot: pilot
      ? {
          id: pilot.id,
          displayName: pilot.displayName,
          licenseNumber: pilot.licenseNumber,
          status: pilot.status,
          isPublic: pilot.isPublic,
          bio: pilot.bio,
          locationCity: pilot.locationCity,
          locationRegion: pilot.locationRegion,
          locationCountry: pilot.locationCountry,
        }
      : null,
    client: client
      ? {
          id: client.id,
          contactName: client.contactName,
          companyName: client.companyName,
          phone: client.phone,
          status: client.status,
        }
      : null,
  };

  return {
    account,
    displayName,
    roleLabel,
    pilotDetail: pilot
      ? {
          profileId: pilot.id,
          displayName: pilot.displayName,
          licenseNumber: pilot.licenseNumber,
          licenseCountry: pilot.licenseCountry,
          status: pilot.status,
          isPublic: pilot.isPublic,
          bio: pilot.bio,
          locationCity: pilot.locationCity,
          locationRegion: pilot.locationRegion,
          locationCountry: pilot.locationCountry,
          serviceRadiusKm: pilot.serviceRadiusKm,
          hourlyRateMin: pilot.hourlyRateMin,
          hourlyRateMax: pilot.hourlyRateMax,
          onboardingCompletedAt:
            pilot.onboardingCompletedAt?.toISOString() ?? null,
          membership: tier
            ? {
                tierName: tier.name,
                tierCode: tier.code,
                status: sub!.status,
                canApply: tier.canApply,
                instructorEligible: tier.instructorEligible,
                jobVisibilityDelayHours: tier.jobVisibilityDelayHours,
                periodEnd: sub!.currentPeriodEnd?.toISOString() ?? null,
              }
            : null,
          wings: pilot.wings.map((w) => ({
            id: w.id,
            code: w.wingDefinition.code,
            title: w.wingDefinition.title,
            earnedAt: w.earnedAt.toISOString(),
          })),
          counts: {
            applications: pilot._count.applications,
            bookings: pilot._count.bookings,
            certificates: pilot._count.certificates,
            reviews: pilot._count.reviewsReceived,
          },
          recentApplications: pilot.applications.map((a) => ({
            id: a.id,
            jobTitle: a.job.title,
            status: a.status,
            proposedAmount: a.proposedAmount,
            currency: a.currency,
            submittedAt: a.submittedAt.toISOString(),
          })),
        }
      : null,
    clientDetail: client
      ? {
          profileId: client.id,
          contactName: client.contactName,
          companyName: client.companyName,
          phone: client.phone,
          billingAddress: client.billingAddress,
          status: client.status,
          onboardingCompletedAt:
            client.onboardingCompletedAt?.toISOString() ?? null,
          counts: {
            jobs: client._count.jobs,
            bookings: client._count.bookings,
            reviews: client._count.reviewsReceived,
          },
          recentJobs: client.jobs.map((j) => ({
            id: j.id,
            title: j.title,
            status: j.status,
            locationLabel: j.locationLabel,
            createdAt: j.createdAt.toISOString(),
          })),
        }
      : null,
  };
}
