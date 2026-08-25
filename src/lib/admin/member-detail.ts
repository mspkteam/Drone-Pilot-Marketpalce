import { prisma } from "@/lib/db";
import { getGradeCommissionRateForLabel } from "@/lib/admin/platform-settings";
import { gradeLabelFromTierCode } from "@/lib/admin/pilot-rates";
import { ensureClientProfileForUser } from "@/lib/admin/user-edit";
import {
  parseClientProfilePreferences,
  type ClientProfilePreferences,
} from "@/lib/client/preferences";
import { toMembershipTierDto } from "@/lib/membership/membership";
import type { AdminUserEditDto } from "@/types/admin-user-edit";
import type { UserRole } from "@/types/roles";
import { displayMemberNumber } from "@/lib/members/member-number";

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
    issuedCertificates: Array<{
      id: string;
      certificateNumber: string;
      templateName: string;
      issuedAt: string;
    }>;
    recentApplications: Array<{
      id: string;
      jobTitle: string;
      status: string;
      proposedAmount: number;
      currency: string;
      submittedAt: string;
    }>;
    commission: {
      defaultPercent: number;
      overrideEnabled: boolean;
      overridePercent: number | null;
      overrideReason: string | null;
    } | null;
    servicesOffered: string[];
    pendingVerifications: number;
  } | null;
  clientDetail: {
    profileId: string;
    contactName: string;
    companyName: string | null;
    phone: string | null;
    billingAddress: string | null;
    status: string;
    onboardingCompletedAt: string | null;
    preferences: ClientProfilePreferences;
    counts: {
      jobs: number;
      bookings: number;
      reviews: number;
      openDisputes: number;
      conversations: number;
    };
    recentJobs: Array<{
      id: string;
      title: string;
      status: string;
      locationLabel: string;
      createdAt: string;
    }>;
    recentBookings: Array<{
      id: string;
      jobTitle: string;
      status: string;
      agreedAmount: number;
      currency: string;
      pilotName: string;
      paymentStatus: string | null;
      createdAt: string;
    }>;
    recentDisputes: Array<{
      id: string;
      jobTitle: string;
      status: string;
      reason: string;
      createdAt: string;
    }>;
    recentConversations: Array<{
      id: string;
      jobTitle: string;
      pilotName: string;
      lastMessageAt: string | null;
    }>;
    recentReviews: Array<{
      id: string;
      rating: number;
      comment: string | null;
      status: string;
      createdAt: string;
    }>;
  } | null;
};

export async function getMemberDetailForAdmin(
  userId: string,
): Promise<AdminMemberDetailDto | null> {
  await ensureClientProfileForUser(userId);

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
              verifications: true,
            },
          },
          certificates: {
            include: { template: { select: { name: true } } },
            orderBy: { issuedAt: "desc" },
            take: 40,
          },
          verifications: {
            where: { status: "pending" },
            select: { id: true },
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
          bookings: {
            orderBy: { createdAt: "desc" },
            take: 8,
            select: {
              id: true,
              status: true,
              agreedAmount: true,
              currency: true,
              createdAt: true,
              job: { select: { title: true } },
              pilotProfile: { select: { displayName: true } },
              payment: { select: { status: true } },
            },
          },
          conversationsAsClient: {
            orderBy: { lastMessageAt: "desc" },
            take: 6,
            select: {
              id: true,
              lastMessageAt: true,
              job: { select: { title: true } },
              pilotProfile: { select: { displayName: true } },
            },
          },
          reviewsReceived: {
            orderBy: { createdAt: "desc" },
            take: 6,
            select: {
              id: true,
              rating: true,
              comment: true,
              status: true,
              createdAt: true,
            },
          },
          _count: {
            select: {
              jobs: true,
              bookings: true,
              reviewsReceived: true,
              conversationsAsClient: true,
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
    ? tier?.code === "A5_FIRST_OFFICER" ||
        tier?.code === "A6_CAPTAIN" ||
        tier?.code === "A7_SENIOR_CAPTAIN" ||
        tier?.code === "A8_MASTER_CAPTAIN" ||
        tier?.code === "A9_FLEET_CAPTAIN" ||
        tier?.code === "A10_COMMODORE"
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
    memberNumber: displayMemberNumber(user.memberNumber),
    moderationNote: user.moderationNote ?? null,
    createdAt: user.createdAt.toISOString(),
    pilot: pilot
      ? {
          id: pilot.id,
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
        }
      : null,
    client: client
      ? {
          id: client.id,
          contactName: client.contactName,
          companyName: client.companyName,
          phone: client.phone,
          billingAddress: client.billingAddress,
          status: client.status,
        }
      : null,
  };

  const tierCode = tier?.code ?? null;
  const gradeLabel = gradeLabelFromTierCode(tierCode);
  const defaultCommissionRate = pilot
    ? await getGradeCommissionRateForLabel(gradeLabel)
    : null;

  const openDisputeCount = client
    ? await prisma.dispute.count({
        where: {
          status: "open",
          booking: { clientProfileId: client.id },
        },
      })
    : 0;

  // Also pull open disputes beyond the recent booking window for the list.
  const clientDisputes = client
    ? await prisma.dispute.findMany({
        where: { booking: { clientProfileId: client.id } },
        orderBy: { createdAt: "desc" },
        take: 8,
        select: {
          id: true,
          status: true,
          reason: true,
          createdAt: true,
          booking: { select: { job: { select: { title: true } } } },
        },
      })
    : [];

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
          issuedCertificates: pilot.certificates.map((cert) => ({
            id: cert.id,
            certificateNumber: cert.certificateNumber,
            templateName: cert.template.name,
            issuedAt: cert.issuedAt.toISOString(),
          })),
          recentApplications: pilot.applications.map((a) => ({
            id: a.id,
            jobTitle: a.job.title,
            status: a.status,
            proposedAmount: a.proposedAmount,
            currency: a.currency,
            submittedAt: a.submittedAt.toISOString(),
          })),
          commission: defaultCommissionRate != null
            ? {
                defaultPercent:
                  Math.round(defaultCommissionRate * 100 * 100) / 100,
                overrideEnabled: pilot.commissionOverrideEnabled,
                overridePercent:
                  pilot.commissionOverrideRate != null
                    ? Math.round(pilot.commissionOverrideRate * 100 * 100) / 100
                    : null,
                overrideReason: pilot.commissionOverrideReason,
              }
            : null,
          servicesOffered: parseServicesOffered(pilot.servicesOffered),
          pendingVerifications: pilot.verifications.length,
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
          preferences: parseClientProfilePreferences(client.preferencesJson),
          counts: {
            jobs: client._count.jobs,
            bookings: client._count.bookings,
            reviews: client._count.reviewsReceived,
            openDisputes: openDisputeCount,
            conversations: client._count.conversationsAsClient,
          },
          recentJobs: client.jobs.map((j) => ({
            id: j.id,
            title: j.title,
            status: j.status,
            locationLabel: j.locationLabel,
            createdAt: j.createdAt.toISOString(),
          })),
          recentBookings: client.bookings.map((b) => ({
            id: b.id,
            jobTitle: b.job.title,
            status: b.status,
            agreedAmount: b.agreedAmount,
            currency: b.currency,
            pilotName: b.pilotProfile.displayName,
            paymentStatus: b.payment?.status ?? null,
            createdAt: b.createdAt.toISOString(),
          })),
          recentDisputes: clientDisputes.map((d) => ({
            id: d.id,
            jobTitle: d.booking.job.title,
            status: d.status,
            reason: d.reason,
            createdAt: d.createdAt.toISOString(),
          })),
          recentConversations: client.conversationsAsClient.map((c) => ({
            id: c.id,
            jobTitle: c.job.title,
            pilotName: c.pilotProfile.displayName,
            lastMessageAt: c.lastMessageAt?.toISOString() ?? null,
          })),
          recentReviews: client.reviewsReceived.map((r) => ({
            id: r.id,
            rating: r.rating,
            comment: r.comment,
            status: r.status,
            createdAt: r.createdAt.toISOString(),
          })),
        }
      : null,
  };
}

function parseServicesOffered(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is string => typeof item === "string");
  } catch {
    return [];
  }
}
