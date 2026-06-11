import { prisma } from "@/lib/db";
import type {
  AdminMissionCategoryRow,
  AdminReportsAnalyticsData,
  AdminReportsExportRow,
  AdminReportsFooterMetric,
  AdminReportsStatCard,
  AdminRevenueMonthPoint,
} from "@/types/admin-reports";
import type { UserRole } from "@/types/roles";

const MONTH_SHORT = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"] as const;

/** Map job category ids into segmentation groups shown in reports UI. */
const CATEGORY_SEGMENT_LABELS: Record<string, string> = {
  inspection: "Inspection & Survey",
  surveying: "Mapping & GIS",
  aerial_video: "Cinematography",
  real_estate: "Inspection & Survey",
  agriculture: "Thermal & Energy",
  events: "Events & Other",
  other: "Events & Other",
};

function startOfQuarter(date: Date): Date {
  const d = new Date(date);
  const qStartMonth = Math.floor(d.getMonth() / 3) * 3;
  d.setMonth(qStartMonth, 1);
  d.setHours(0, 0, 0, 0);
  return d;
}

function startOfMonth(date: Date): Date {
  const d = new Date(date);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
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

function formatCount(value: number): string {
  return value.toLocaleString();
}

function buildLast12MonthBuckets(): {
  start: Date;
  end: Date;
  monthShort: string;
  monthLabel: string;
}[] {
  const now = new Date();
  const buckets: {
    start: Date;
    end: Date;
    monthShort: string;
    monthLabel: string;
  }[] = [];

  for (let i = 11; i >= 0; i -= 1) {
    const start = startOfMonth(new Date(now.getFullYear(), now.getMonth() - i, 1));
    const end = startOfMonth(new Date(start.getFullYear(), start.getMonth() + 1, 1));
    buckets.push({
      start,
      end,
      monthShort: MONTH_SHORT[start.getMonth()]!,
      monthLabel: start.toLocaleDateString("en-US", { month: "short" }),
    });
  }

  return buckets;
}

async function getRevenueMonths(): Promise<AdminRevenueMonthPoint[]> {
  const buckets = buildLast12MonthBuckets();
  const rangeStart = buckets[0]!.start;

  const payments = await prisma.payment.findMany({
    where: { createdAt: { gte: rangeStart } },
    select: {
      createdAt: true,
      amountGross: true,
      amountNet: true,
      commission: { select: { amount: true } },
    },
  });

  return buckets.map((bucket) => {
    const inMonth = payments.filter(
      (p) => p.createdAt >= bucket.start && p.createdAt < bucket.end,
    );
    const gross = inMonth.reduce((sum, p) => sum + p.amountGross, 0);
    const commission = inMonth.reduce(
      (sum, p) => sum + (p.commission?.amount ?? gross - p.amountNet),
      0,
    );
    const marginPct = gross > 0 ? (commission / gross) * 100 : 0;

    return {
      monthLabel: bucket.monthLabel,
      monthShort: bucket.monthShort,
      operatingProfit: Math.round(commission),
      grossMarginPct: Math.round(marginPct * 10) / 10,
    };
  });
}

async function getMissionMonths(): Promise<AdminRevenueMonthPoint[]> {
  const buckets = buildLast12MonthBuckets();
  const rangeStart = buckets[0]!.start;

  const bookings = await prisma.booking.findMany({
    where: {
      status: "completed",
      completedAt: { gte: rangeStart },
    },
    select: { completedAt: true },
  });

  return buckets.map((bucket) => {
    const count = bookings.filter((b) => {
      const at = b.completedAt;
      return at && at >= bucket.start && at < bucket.end;
    }).length;

    return {
      monthLabel: bucket.monthLabel,
      monthShort: bucket.monthShort,
      operatingProfit: count,
      grossMarginPct: 0,
    };
  });
}

async function getMissionCategories(): Promise<AdminMissionCategoryRow[]> {
  const bookings = await prisma.booking.findMany({
    where: { status: "completed" },
    select: { job: { select: { category: true } } },
  });

  const counts = new Map<string, number>();
  for (const row of bookings) {
    const segment = CATEGORY_SEGMENT_LABELS[row.job.category] ?? "Events & Other";
    counts.set(segment, (counts.get(segment) ?? 0) + 1);
  }

  const total = bookings.length;
  if (total === 0) {
    return [
      { id: "inspection", label: "Inspection & Survey", pct: 38 },
      { id: "cinematography", label: "Cinematography", pct: 24 },
      { id: "mapping", label: "Mapping & GIS", pct: 18 },
      { id: "thermal", label: "Thermal & Energy", pct: 12 },
      { id: "events", label: "Events & Other", pct: 8 },
    ];
  }

  const sorted = [...counts.entries()]
    .map(([label, count]) => ({
      id: label.toLowerCase().replace(/\s+/g, "-"),
      label,
      pct: Math.round((count / total) * 100),
    }))
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 5);

  const pctSum = sorted.reduce((s, r) => s + r.pct, 0);
  if (pctSum < 100 && sorted.length > 0) {
    sorted[sorted.length - 1]!.pct += 100 - pctSum;
  }

  return sorted;
}

async function getStatCards(role: UserRole): Promise<AdminReportsStatCard[]> {
  const now = new Date();
  const qStart = startOfQuarter(now);
  const prevQStart = new Date(qStart);
  prevQStart.setMonth(prevQStart.getMonth() - 3);
  const isSuperAdmin = role === "super_admin";

  const [
    revenueQtd,
    revenuePrevQtd,
    missionsQtd,
    missionsPrevQtd,
    clientsQtd,
    clientsPrevQtd,
    pilotsQtd,
    pilotsPrevQtd,
    openCases,
    highPriorityCases,
  ] = await Promise.all([
    prisma.payment.aggregate({
      _sum: { amountGross: true },
      where: { createdAt: { gte: qStart } },
    }),
    prisma.payment.aggregate({
      _sum: { amountGross: true },
      where: { createdAt: { gte: prevQStart, lt: qStart } },
    }),
    prisma.booking.count({
      where: { status: "completed", completedAt: { gte: qStart } },
    }),
    prisma.booking.count({
      where: {
        status: "completed",
        completedAt: { gte: prevQStart, lt: qStart },
      },
    }),
    prisma.clientProfile.count({
      where: { createdAt: { gte: qStart } },
    }),
    prisma.clientProfile.count({
      where: { createdAt: { gte: prevQStart, lt: qStart } },
    }),
    prisma.pilotProfile.count({
      where: { onboardingCompletedAt: { gte: qStart } },
    }),
    prisma.pilotProfile.count({
      where: {
        onboardingCompletedAt: { gte: prevQStart, lt: qStart },
      },
    }),
    prisma.dispute.count({
      where: { status: { in: ["open", "under_review"] } },
    }),
    prisma.dispute.count({ where: { status: "open" } }),
  ]);

  const revQ = revenueQtd._sum.amountGross ?? 0;
  const revPrev = revenuePrevQtd._sum.amountGross ?? 0;

  const operational: AdminReportsStatCard[] = [
    {
      label: "MISSIONS COMPLETED",
      value: formatCount(missionsQtd),
      subtext: pctChangeLabel(missionsQtd, missionsPrevQtd, ""),
      subtextTone: missionsQtd >= missionsPrevQtd ? "success" : "muted",
    },
    {
      label: "NEW CLIENTS",
      value: formatCount(clientsQtd),
      subtext: pctChangeLabel(clientsQtd, clientsPrevQtd, ""),
      subtextTone: clientsQtd >= clientsPrevQtd ? "success" : "muted",
    },
    {
      label: "PILOT ONBOARDINGS",
      value: formatCount(pilotsQtd),
      subtext: pctChangeLabel(pilotsQtd, pilotsPrevQtd, ""),
      subtextTone: pilotsQtd >= pilotsPrevQtd ? "success" : "muted",
    },
  ];

  if (isSuperAdmin) {
    return [
      {
        label: "REVENUE (QTD)",
        value: formatRevenue(revQ),
        subtext: pctChangeLabel(revQ, revPrev, "vs last quarter"),
        subtextTone: revQ >= revPrev ? "success" : "muted",
      },
      ...operational,
    ];
  }

  return [
    {
      label: "OPEN CASES",
      value: formatCount(openCases),
      subtext:
        highPriorityCases > 0
          ? `${highPriorityCases} high priority`
          : "No high-priority cases",
      subtextTone: "muted",
    },
    ...operational,
  ];
}

async function getFooterMetrics(
  role: UserRole,
): Promise<AdminReportsFooterMetric[]> {
  const isSuperAdmin = role === "super_admin";

  const [payments, approvedPilots, commissionAgg] = await Promise.all([
    prisma.payment.findMany({
      select: {
        amountGross: true,
        commission: { select: { amount: true } },
      },
    }),
    prisma.pilotProfile.count({ where: { status: "approved" } }),
    prisma.commission.aggregate({ _sum: { amount: true } }),
  ]);

  const grossTotal = payments.reduce((s, p) => s + p.amountGross, 0);
  const commissionTotal = payments.reduce(
    (s, p) => s + (p.commission?.amount ?? 0),
    0,
  );
  const avgMargin =
    grossTotal > 0 ? ((commissionTotal / grossTotal) * 100).toFixed(1) : "0.0";
  const opsCost = commissionAgg._sum.amount ?? 0;

  const metrics: AdminReportsFooterMetric[] = [];

  if (isSuperAdmin) {
    metrics.push({
      label: "AVERAGE MARGIN",
      value: `${avgMargin}%`,
      tone: "gold",
    });
  }

  metrics.push({
    label: "ACTIVE DRONES",
    value: formatCount(approvedPilots),
    tone: "default",
  });

  if (isSuperAdmin) {
    metrics.push({
      label: "OPS COST",
      value: formatRevenue(opsCost),
      tone: "warning",
    });
  }

  return metrics;
}

function buildExportRows(
  data: Omit<AdminReportsAnalyticsData, "exportRows">,
): AdminReportsExportRow[] {
  const rows: AdminReportsExportRow[] = [];

  for (const stat of data.stats) {
    rows.push({
      section: "Summary",
      label: stat.label,
      value: `${stat.value} (${stat.subtext})`,
    });
  }

  for (const month of data.revenueMonths) {
    rows.push({
      section: data.showFinancialChart ? "Revenue Operations" : "Mission Operations",
      label: month.monthLabel,
      value: data.showFinancialChart
        ? `Profit ${month.operatingProfit}, Margin ${month.grossMarginPct}%`
        : `Missions ${month.operatingProfit}`,
    });
  }

  for (const cat of data.missionCategories) {
    rows.push({
      section: "Mission Categories",
      label: cat.label,
      value: `${cat.pct}%`,
    });
  }

  for (const metric of data.footerMetrics) {
    rows.push({
      section: "Footer Metrics",
      label: metric.label,
      value: metric.value,
    });
  }

  return rows;
}

export async function getAdminReportsAnalyticsData(
  role: UserRole,
): Promise<AdminReportsAnalyticsData> {
  const isSuperAdmin = role === "super_admin";
  const showFinancialChart = isSuperAdmin;

  const [stats, revenueMonths, missionMonths, missionCategories, footerMetrics] =
    await Promise.all([
      getStatCards(role),
      getRevenueMonths(),
      getMissionMonths(),
      getMissionCategories(),
      getFooterMetrics(role),
    ]);

  const partial = {
    isSuperAdmin,
    stats,
    revenueMonths: showFinancialChart ? revenueMonths : missionMonths,
    missionCategories,
    footerMetrics,
    showFinancialChart,
    chartTitle: showFinancialChart ? "REVENUE OPERATIONS" : "MISSION OPERATIONS",
    chartSubtitle: "LAST 12 MONTHS",
    syncedAt: new Date().toISOString(),
  };

  return {
    ...partial,
    exportRows: buildExportRows(partial),
  };
}
