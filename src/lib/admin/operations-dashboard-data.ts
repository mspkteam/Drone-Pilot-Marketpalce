import { listDisputesForAdmin } from "@/lib/disputes/dispute";
import { prisma } from "@/lib/db";
import { getVerificationTypeLabel } from "@/lib/verification/status";
import type {
  AdminActionQueueItem,
  AdminGrowthSeriesPoint,
  AdminOperationsDashboardData,
  AdminOperationsExportRow,
  AdminOperationsStatCard,
  AdminRecentSignup,
  AdminSystemIntegrityMetric,
} from "@/types/admin-operations";
import type { UserRole } from "@/types/roles";

const GROWTH_WEEKS = 13;

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatWeekLabel(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatTimeAgo(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  if (hours < 1) return "JUST NOW";
  if (hours < 24) return `${hours}H AGO`;
  const days = Math.floor(hours / 24);
  return `${days}D AGO`;
}

function initialsFromName(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]!.charAt(0)}${parts[1]!.charAt(0)}`.toUpperCase();
  }
  return name.replace(/[^a-zA-Z0-9]/g, "").slice(0, 2).toUpperCase() || "??";
}

function pctChangeLabel(current: number, previous: number, suffix: string): string {
  if (previous === 0) {
    return current > 0 ? `+100% ${suffix}` : `No change ${suffix}`;
  }
  const pct = ((current - previous) / previous) * 100;
  const sign = pct >= 0 ? "+" : "";
  return `${sign}${pct.toFixed(0)}% ${suffix}`;
}

function formatRevenue(amount: number): string {
  if (amount >= 1_000_000) {
    return `$${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (amount >= 1_000) {
    return `$${Math.round(amount / 1_000)}K`;
  }
  return `$${Math.round(amount).toLocaleString()}`;
}

function buildGrowthBuckets(): { start: Date; label: string }[] {
  const now = new Date();
  const currentWeek = startOfWeek(now);
  const buckets: { start: Date; label: string }[] = [];

  for (let i = GROWTH_WEEKS - 1; i >= 0; i -= 1) {
    const start = new Date(currentWeek);
    start.setDate(start.getDate() - i * 7);
    buckets.push({ start, label: formatWeekLabel(start) });
  }

  return buckets;
}

async function getGrowthSeries(): Promise<AdminGrowthSeriesPoint[]> {
  const buckets = buildGrowthBuckets();
  const rangeStart = buckets[0]!.start;
  const rangeEnd = new Date();
  rangeEnd.setDate(rangeEnd.getDate() + 7);

  const [completedBookings, onboardedPilots] = await Promise.all([
    prisma.booking.findMany({
      where: {
        status: "completed",
        completedAt: { gte: rangeStart, lt: rangeEnd },
      },
      select: { completedAt: true },
    }),
    prisma.pilotProfile.findMany({
      where: {
        onboardingCompletedAt: { gte: rangeStart, lt: rangeEnd },
      },
      select: { onboardingCompletedAt: true },
    }),
  ]);

  return buckets.map((bucket, index) => {
    const nextStart =
      index < buckets.length - 1
        ? buckets[index + 1]!.start
        : new Date(rangeEnd);

    const missionsCompleted = completedBookings.filter((row) => {
      const at = row.completedAt;
      return at && at >= bucket.start && at < nextStart;
    }).length;

    const newPilotsOnboarded = onboardedPilots.filter((row) => {
      const at = row.onboardingCompletedAt;
      return at && at >= bucket.start && at < nextStart;
    }).length;

    return {
      label: bucket.label,
      missionsCompleted,
      newPilotsOnboarded,
    };
  });
}

async function buildActionQueue(): Promise<AdminActionQueueItem[]> {
  const items: AdminActionQueueItem[] = [];

  const [pendingVerification, openDisputes, pendingPilot] = await Promise.all([
    prisma.verification.findFirst({
      where: { status: "pending" },
      orderBy: { submittedAt: "asc" },
      include: {
        pilotProfile: {
          select: { displayName: true },
        },
      },
    }),
    listDisputesForAdmin("open"),
    prisma.pilotProfile.findFirst({
      where: { status: "pending_review" },
      orderBy: { createdAt: "asc" },
      include: {
        subscriptions: {
          where: { status: "active" },
          take: 1,
          include: { subscriptionPlan: { select: { name: true } } },
        },
      },
    }),
  ]);

  if (pendingVerification) {
    const typeLabel = getVerificationTypeLabel(
      pendingVerification.type as Parameters<typeof getVerificationTypeLabel>[0],
    );
    items.push({
      id: `verification-${pendingVerification.id}`,
      typeLabel: "OFFICER VERIFICATION",
      text: `${pendingVerification.pilotProfile.displayName} · ${typeLabel} pending`,
      actionLabel: "REVIEW",
      href: "/dashboard/admin/verifications",
      tone: "gold",
      icon: "shield",
    });
  }

  const flaggedDispute = openDisputes[0];
  if (flaggedDispute) {
    items.push({
      id: `dispute-flag-${flaggedDispute.id}`,
      typeLabel: "FLAGGED MISSION",
      text: `${flaggedDispute.booking.job.title} · ${flaggedDispute.reason}`,
      actionLabel: "INVESTIGATE",
      href: `/dashboard/admin/disputes/${flaggedDispute.id}`,
      tone: "red",
      icon: "alert",
    });
  }

  if (pendingPilot) {
    const tierName =
      pendingPilot.subscriptions[0]?.subscriptionPlan.name ?? "Profile pending review";
    items.push({
      id: `pilot-${pendingPilot.id}`,
      typeLabel: "PILOT APPLICATION",
      text: `${pendingPilot.displayName} · ${tierName}`,
      actionLabel: "APPROVE",
      href: "/dashboard/admin/pilots",
      tone: "gold",
      icon: "user-plus",
    });
  }

  const paymentDispute = openDisputes[1] ?? openDisputes[0];
  if (paymentDispute && paymentDispute.id !== flaggedDispute?.id) {
    items.push({
      id: `dispute-payment-${paymentDispute.id}`,
      typeLabel: "SYSTEM ALERT",
      text: `Payment dispute — ${paymentDispute.booking.job.title}`,
      actionLabel: "OPEN",
      href: `/dashboard/admin/disputes/${paymentDispute.id}`,
      tone: "red",
      icon: "wallet",
    });
  } else if (paymentDispute && items.length < 4) {
    items.push({
      id: `dispute-open-${paymentDispute.id}`,
      typeLabel: "SYSTEM ALERT",
      text: `Payment dispute — ${paymentDispute.booking.client.companyName ?? paymentDispute.booking.client.contactName}`,
      actionLabel: "OPEN",
      href: `/dashboard/admin/disputes/${paymentDispute.id}`,
      tone: "red",
      icon: "wallet",
    });
  }

  return items.slice(0, 4);
}

async function getRecentSignups(): Promise<AdminRecentSignup[]> {
  const rows = await prisma.clientProfile.findMany({
    orderBy: { createdAt: "desc" },
    take: 4,
    select: {
      id: true,
      companyName: true,
      contactName: true,
      createdAt: true,
    },
  });

  return rows.map((row) => {
    const name = row.companyName?.trim() || row.contactName;
    return {
      id: row.id,
      initials: initialsFromName(name),
      name,
      timeAgo: formatTimeAgo(row.createdAt),
      badge: "CLIENT" as const,
    };
  });
}

async function getStatCards(
  role: UserRole,
): Promise<AdminOperationsStatCard[]> {
  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const twoWeeksAgo = new Date(now);
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
  const monthAgo = new Date(now);
  monthAgo.setMonth(monthAgo.getMonth() - 1);
  const twoMonthsAgo = new Date(now);
  twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
  const quarterAgo = new Date(now);
  quarterAgo.setMonth(quarterAgo.getMonth() - 3);
  const sixMonthsAgo = new Date(now);
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const [
    activeClients,
    clientsLastWeek,
    clientsPrevWeek,
    verifiedPilots,
    pilotsThisMonth,
    pilotsPrevMonth,
    liveMissions,
    awaitingHandover,
    revenueAgg,
    revenueThisQuarter,
    revenuePrevQuarter,
    openCases,
    highPriorityCases,
  ] = await Promise.all([
    prisma.clientProfile.count({
      where: { user: { status: "active" } },
    }),
    prisma.clientProfile.count({
      where: { createdAt: { gte: weekAgo }, user: { status: "active" } },
    }),
    prisma.clientProfile.count({
      where: {
        createdAt: { gte: twoWeeksAgo, lt: weekAgo },
        user: { status: "active" },
      },
    }),
    prisma.pilotProfile.count({ where: { status: "approved" } }),
    prisma.pilotProfile.count({
      where: { status: "approved", updatedAt: { gte: monthAgo } },
    }),
    prisma.pilotProfile.count({
      where: {
        status: "approved",
        updatedAt: { gte: twoMonthsAgo, lt: monthAgo },
      },
    }),
    prisma.booking.count({
      where: { status: { in: ["pending", "confirmed", "in_progress"] } },
    }),
    prisma.booking.count({
      where: { status: { in: ["pending", "confirmed"] } },
    }),
    prisma.payment.aggregate({ _sum: { amountGross: true } }),
    prisma.payment.aggregate({
      _sum: { amountGross: true },
      where: { createdAt: { gte: quarterAgo } },
    }),
    prisma.payment.aggregate({
      _sum: { amountGross: true },
      where: { createdAt: { gte: sixMonthsAgo, lt: quarterAgo } },
    }),
    prisma.dispute.count({
      where: { status: { in: ["open", "under_review"] } },
    }),
    prisma.dispute.count({ where: { status: "open" } }),
  ]);

  const totalRevenue = revenueAgg._sum.amountGross ?? 0;
  const quarterRevenue = revenueThisQuarter._sum.amountGross ?? 0;
  const prevQuarterRevenue = revenuePrevQuarter._sum.amountGross ?? 0;

  const baseStats: AdminOperationsStatCard[] = [
    {
      label: "ACTIVE CLIENTS",
      value: String(activeClients),
      subtext: pctChangeLabel(clientsLastWeek, clientsPrevWeek, "vs last week"),
      subtextTone: clientsLastWeek >= clientsPrevWeek ? "success" : "muted",
    },
    {
      label: "VERIFIED PILOTS",
      value: String(verifiedPilots),
      subtext: pctChangeLabel(pilotsThisMonth, pilotsPrevMonth, "this month"),
      subtextTone: pilotsThisMonth >= pilotsPrevMonth ? "success" : "muted",
    },
    {
      label: "LIVE MISSIONS",
      value: String(liveMissions),
      subtext:
        awaitingHandover > 0
          ? `${awaitingHandover} awaiting handover`
          : "All missions in progress",
      subtextTone: "muted",
    },
  ];

  if (role === "super_admin") {
    baseStats.push({
      label: "TOTAL REVENUE",
      value: formatRevenue(totalRevenue),
      subtext: pctChangeLabel(
        quarterRevenue,
        prevQuarterRevenue,
        "quarter to date",
      ),
      subtextTone: quarterRevenue >= prevQuarterRevenue ? "success" : "muted",
    });
  } else {
    baseStats.push({
      label: "OPEN CASES",
      value: String(openCases),
      subtext:
        highPriorityCases > 0
          ? `${highPriorityCases} high priority`
          : "No high-priority cases",
      subtextTone: highPriorityCases > 0 ? "muted" : "muted",
    });
  }

  return baseStats;
}

function buildSystemIntegrity(): AdminSystemIntegrityMetric[] {
  return [
    { label: "UPTIME", value: "99.9%", fillPct: 99.9 },
    { label: "API LATENCY", value: "34MS", fillPct: 88 },
    { label: "ERRORS", value: "0.12%", fillPct: 12 },
  ];
}

function buildExportRows(
  data: Omit<AdminOperationsDashboardData, "exportRows">,
): AdminOperationsExportRow[] {
  const rows: AdminOperationsExportRow[] = [];

  for (const stat of data.stats) {
    rows.push({
      section: "Stats",
      label: stat.label,
      value: `${stat.value} (${stat.subtext})`,
    });
  }

  for (const item of data.actionQueue) {
    rows.push({
      section: "Action Queue",
      label: item.typeLabel,
      value: `${item.text} — ${item.actionLabel}`,
    });
  }

  for (const signup of data.recentSignups) {
    rows.push({
      section: "Recent Sign-ups",
      label: signup.name,
      value: `${signup.badge} · ${signup.timeAgo}`,
    });
  }

  return rows;
}

export async function getAdminOperationsDashboardData(options: {
  role: UserRole;
  commanderName: string;
}): Promise<AdminOperationsDashboardData> {
  const isSuperAdmin = options.role === "super_admin";

  const [stats, growth, actionQueue, recentSignups] = await Promise.all([
    getStatCards(options.role),
    getGrowthSeries(),
    buildActionQueue(),
    getRecentSignups(),
  ]);

  const partial = {
    commanderName: options.commanderName,
    isSuperAdmin,
    stats,
    growth,
    actionQueue,
    recentSignups,
    systemIntegrity: buildSystemIntegrity(),
  };

  return {
    ...partial,
    exportRows: buildExportRows(partial),
  };
}
