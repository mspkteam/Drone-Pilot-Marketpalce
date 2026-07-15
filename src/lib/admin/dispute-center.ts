import {
  assessDisputePriority,
} from "@/lib/admin/dispute-center-filters";
import { listDisputesForAdmin } from "@/lib/disputes/dispute";
import { prisma } from "@/lib/db";
import type {
  AdminDisputeCenterData,
  AdminDisputeStatCard,
} from "@/types/admin-dispute";

async function buildStats(): Promise<AdminDisputeStatCard[]> {
  const now = Date.now();
  const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now - 60 * 24 * 60 * 60 * 1000);

  const [activeDisputes, resolvedLast30, resolvedPrev30, resolvedCount] =
    await Promise.all([
      listDisputesForAdmin("all").then((disputes) =>
        disputes.filter(
          (dispute) =>
            dispute.status === "open" || dispute.status === "under_review",
        ),
      ),
      prisma.dispute.findMany({
        where: {
          status: "resolved",
          resolvedAt: { gte: thirtyDaysAgo },
        },
        select: { createdAt: true, resolvedAt: true },
      }),
      prisma.dispute.findMany({
        where: {
          status: "resolved",
          resolvedAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
        },
        select: { createdAt: true, resolvedAt: true },
      }),
      prisma.dispute.count({ where: { status: "resolved" } }),
    ]);

  const openCases = activeDisputes.length;
  const highPriority = activeDisputes.filter(
    (dispute) => assessDisputePriority(dispute) === "high",
  ).length;

  const avgHours = (rows: { createdAt: Date; resolvedAt: Date | null }[]) => {
    const deltas = rows
      .map((row) => {
        if (!row.resolvedAt) return null;
        return row.resolvedAt.getTime() - row.createdAt.getTime();
      })
      .filter((value): value is number => value != null);

    if (deltas.length === 0) return null;
    return Math.round(
      deltas.reduce((sum, value) => sum + value, 0) / deltas.length / (1000 * 60 * 60),
    );
  };

  const avgCurrent = avgHours(resolvedLast30);
  const avgPrevious = avgHours(resolvedPrev30);

  let resolutionValue = "—";
  let resolutionSubtext = "No resolved cases in 30d";
  if (avgCurrent != null) {
    resolutionValue = `${avgCurrent}H`;
    if (avgPrevious != null) {
      const delta = avgPrevious - avgCurrent;
      resolutionSubtext =
        delta >= 0
          ? `-${delta}h vs last month`
          : `+${Math.abs(delta)}h vs last month`;
    } else {
      resolutionSubtext = "vs prior period —";
    }
  }

  const closedDenom = resolvedCount + openCases;
  const satisfactionValue =
    closedDenom > 0
      ? `${Math.round((resolvedCount / closedDenom) * 100)}%`
      : "—";
  const satisfactionSubtext =
    resolvedCount > 0
      ? `${resolvedCount} resolved total`
      : "No resolved disputes yet";

  return [
    {
      label: "OPEN CASES",
      value: String(openCases),
      subtext:
        highPriority > 0
          ? `${highPriority} high priority`
          : "No high priority flags",
      tone: "gold",
    },
    {
      label: "AVG. RESOLUTION",
      value: resolutionValue,
      subtext: resolutionSubtext,
      tone: "neutral",
    },
    {
      label: "SQUADRON VOTING",
      value: "0",
      subtext: "Post-MVP (not enabled)",
      tone: "warning",
    },
    {
      label: "SATISFACTION SCORE",
      value: satisfactionValue,
      subtext: satisfactionSubtext,
      tone: "success",
    },
  ];
}

export async function getDisputeCenterData(): Promise<AdminDisputeCenterData> {
  const stats = await buildStats();
  return { stats, usingMockStats: false };
}

export async function getConversationIdForBooking(
  bookingId: string,
): Promise<string | null> {
  const conversation = await prisma.conversation.findFirst({
    where: { bookingId },
    select: { id: true },
  });
  return conversation?.id ?? null;
}
