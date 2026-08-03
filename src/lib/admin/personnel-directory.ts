import { prisma } from "@/lib/db";
import type {
  PersonnelDirectoryData,
  PersonnelRow,
  PersonnelStatCard,
  PersonnelStatusTone,
} from "@/types/admin-personnel";
import {
  isManagementUserRole,
  type UserRole,
} from "@/types/roles";

const ELITE_TIER_CODES = new Set([
  "A5_FIRST_OFFICER",
  "A6_CAPTAIN",
  "A7_SENIOR_CAPTAIN",
  "A8_MASTER_CAPTAIN",
  "A9_FLEET_CAPTAIN",
  "A10_COMMODORE",
]);

function formatTimeAgo(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / (1000 * 60));
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
  const months = Math.floor(days / 30);
  return `${months} month${months === 1 ? "" : "s"} ago`;
}

function inferRegion(
  country: string | null | undefined,
  region: string | null | undefined,
): string {
  const value = `${country ?? ""} ${region ?? ""}`.toLowerCase();
  if (!value.trim()) return "Global";

  if (
    /united states|usa|\bus\b|canada|mexico/.test(value)
  ) {
    return "North America";
  }
  if (
    /uk|united kingdom|germany|france|spain|italy|netherlands|europe|sweden|norway/.test(
      value,
    )
  ) {
    return "Western Europe";
  }
  if (/japan|china|australia|india|singapore|asia|pacific|korea/.test(value)) {
    return "Asia Pacific";
  }
  if (/uae|saudi|qatar|middle east|israel|turkey/.test(value)) {
    return "Middle East";
  }
  if (/south africa|nigeria|kenya|africa|egypt/.test(value)) {
    return "Africa";
  }
  if (/brazil|mexico|argentina|chile|latin|south america/.test(value)) {
    return "Latin America";
  }

  return "Global";
}

function buildDisplayId(
  role: UserRole,
  userId: string,
  isEnterprise: boolean,
): string {
  if (isEnterprise) {
    return `ENT-${userId.slice(-4).toUpperCase()}`;
  }
  if (role === "moderator" || role === "admin" || role === "super_admin") {
    return `OPS-${userId.slice(-4).toUpperCase()}`;
  }
  const regionPrefix = userId.slice(0, 4).toUpperCase();
  return `RAS-${regionPrefix}`;
}

function mapPilotRoleLabel(
  tierCode: string | null,
  instructorEligible: boolean,
): { label: string; filter: string } {
  if (tierCode && ELITE_TIER_CODES.has(tierCode)) {
    return { label: "Elite Pilot", filter: "Elite Pilot" };
  }
  if (instructorEligible) {
    return { label: "Squadron Lead", filter: "Squadron Lead" };
  }
  return { label: "Pilot", filter: "Pilot" };
}

function mapStatus(
  userStatus: string,
  options: {
    pilotStatus?: string | null;
    clientStatus?: string | null;
    isClient?: boolean;
    isEnterprise?: boolean;
    region?: string;
  },
): { label: string; tone: PersonnelStatusTone } {
  if (userStatus === "suspended" || userStatus === "inactive") {
    return { label: "SUSPENDED", tone: "danger" };
  }
  if (userStatus === "pending") {
    return { label: "PENDING", tone: "pending" };
  }
  if (options.pilotStatus) {
    if (
      options.pilotStatus === "pending_review" ||
      options.pilotStatus === "draft" ||
      options.pilotStatus === "rejected"
    ) {
      return { label: "PENDING", tone: "pending" };
    }
    if (options.pilotStatus === "suspended") {
      return { label: "SUSPENDED", tone: "danger" };
    }
    return { label: "ACTIVE DUTY", tone: "success" };
  }
  if (options.isClient) {
    if (
      options.clientStatus === "pending_review" ||
      options.clientStatus === "draft"
    ) {
      return { label: "PENDING", tone: "pending" };
    }
    if (options.clientStatus === "suspended") {
      return { label: "SUSPENDED", tone: "danger" };
    }
    if (options.isEnterprise && options.region === "Global") {
      return { label: "MULTINATIONAL", tone: "success" };
    }
    return { label: "ACTIVE CONTRACT", tone: "success" };
  }
  return { label: "ACTIVE DUTY", tone: "success" };
}

function viewHrefForMember(userId: string): string {
  return `/dashboard/admin/users/${userId}`;
}

async function buildRowsFromDatabase(
  isSuperAdmin: boolean,
): Promise<PersonnelRow[]> {
  const users = await prisma.user.findMany({
    where: {
      role: { notIn: ["moderator", "admin", "super_admin"] },
    },
    orderBy: { createdAt: "desc" },
    include: {
      pilotProfile: {
        select: {
          id: true,
          displayName: true,
          status: true,
          locationCountry: true,
          locationRegion: true,
          _count: { select: { wings: true } },
          subscriptions: {
            where: { status: "active" },
            take: 1,
            include: {
              subscriptionPlan: {
                select: { code: true, instructorEligible: true },
              },
            },
          },
        },
      },
      clientProfile: {
        select: {
          id: true,
          contactName: true,
          companyName: true,
          status: true,
        },
      },
    },
  });

  return users.map((user) => {
    const role = user.role as UserRole;
    const pilot = user.pilotProfile;
    const client = user.clientProfile;
    const tier = pilot?.subscriptions[0]?.subscriptionPlan ?? null;
    const isEnterprise = Boolean(client?.companyName?.trim());
    const region = pilot
      ? inferRegion(pilot.locationCountry, pilot.locationRegion)
      : "Global";

    let roleLabel = "Client";
    let roleFilter = "Client";

    if (pilot) {
      const mapped = mapPilotRoleLabel(
        tier?.code ?? null,
        tier?.instructorEligible ?? false,
      );
      roleLabel = mapped.label;
      roleFilter = mapped.filter;
    } else if (isEnterprise) {
      roleLabel = "Enterprise Client";
      roleFilter = "Enterprise Client";
    }

    const name = (
      pilot?.displayName ??
      client?.companyName ??
      client?.contactName ??
      user.email.split("@")[0] ??
      "Unknown"
    ).toUpperCase();

    const status = mapStatus(user.status, {
      pilotStatus: pilot?.status,
      clientStatus: client?.status,
      isClient: Boolean(client),
      isEnterprise,
      region,
    });

    const createdAt = user.createdAt;
    const viewHref = viewHrefForMember(user.id);
    const editHref = isSuperAdmin ? viewHref : null;

    return {
      id: user.id,
      displayId: buildDisplayId(role, user.id, isEnterprise),
      name,
      role,
      roleLabel,
      roleFilter,
      region,
      wingsLabel: pilot ? pilot._count.wings.toLocaleString() : "—",
      statusLabel: status.label,
      statusTone: status.tone,
      joinedAt: createdAt.toISOString(),
      joinedLabel: formatTimeAgo(createdAt),
      viewHref,
      editHref,
      isManagementUser: isManagementUserRole(role),
    };
  });
}

async function buildStats(): Promise<PersonnelStatCard[]> {
  const monthAgo = new Date();
  monthAgo.setMonth(monthAgo.getMonth() - 1);
  const memberRoles = ["pilot", "client"] as const;

  const [
    totalMembers,
    membersThisMonth,
    totalPilots,
    totalClients,
    clientsThisMonth,
    distinctRegions,
  ] = await Promise.all([
    prisma.user.count({ where: { role: { in: [...memberRoles] } } }),
    prisma.user.count({
      where: { role: { in: [...memberRoles] }, createdAt: { gte: monthAgo } },
    }),
    prisma.pilotProfile.count(),
    prisma.clientProfile.count(),
    prisma.clientProfile.count({ where: { createdAt: { gte: monthAgo } } }),
    prisma.pilotProfile.findMany({
      select: { locationCountry: true, locationRegion: true },
      where: {
        OR: [
          { locationCountry: { not: null } },
          { locationRegion: { not: null } },
        ],
      },
    }),
  ]);

  const regionSet = new Set(
    distinctRegions.map((p) =>
      inferRegion(p.locationCountry, p.locationRegion),
    ),
  );

  return [
    {
      label: "TOTAL MEMBERS",
      value: totalMembers.toLocaleString(),
      subtext: `+${membersThisMonth} this month`,
      subtextTone: membersThisMonth > 0 ? "success" : "muted",
    },
    {
      label: "PILOTS",
      value: totalPilots.toLocaleString(),
      subtext: `across ${Math.max(regionSet.size, 1)} regions`,
      subtextTone: "muted",
    },
    {
      label: "CLIENTS",
      value: totalClients.toLocaleString(),
      subtext: `+${clientsThisMonth} this month`,
      subtextTone: clientsThisMonth > 0 ? "success" : "muted",
    },
    {
      label: "REGIONS",
      value: Math.max(regionSet.size, 1).toLocaleString(),
      subtext: "active pilot coverage",
      subtextTone: "muted",
    },
  ];
}

export async function getPersonnelDirectoryData(options: {
  isSuperAdmin: boolean;
}): Promise<PersonnelDirectoryData> {
  const [dbRows, stats] = await Promise.all([
    buildRowsFromDatabase(options.isSuperAdmin),
    buildStats(),
  ]);

  return {
    rows: dbRows,
    stats,
    usingMockRows: false,
  };
}
