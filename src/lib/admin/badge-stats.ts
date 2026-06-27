import { prisma } from "@/lib/db";
import type { AdminBadgeStatsDto } from "@/types/admin-badges";
import type { WingDefinitionDto } from "@/types/wing";

function growthSubtext(current: number, previous: number): string {
  if (previous <= 0) return current > 0 ? "+100%" : "—";
  const pct = Math.round(((current - previous) / previous) * 100);
  return pct >= 0 ? `+${pct}%` : `${pct}%`;
}

function buildMockStats(): AdminBadgeStatsDto {
  return {
    totalBadges: 32,
    awarded30d: 1204,
    awarded30dSubtext: "+18%",
    mostEarnedTitle: "First Bid",
    mostEarnedSubtext: "2,840 pilots",
    rarestTitle: "Founding Aviator",
    rarestSubtext: "36 holders",
    usingMockStats: true,
  };
}

export async function getBadgeStatsForAdmin(
  definitions: WingDefinitionDto[],
): Promise<AdminBadgeStatsDto> {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  const [awarded30d, awardedPrev30d, totalAwards] = await Promise.all([
    prisma.pilotWing.count({ where: { earnedAt: { gte: thirtyDaysAgo } } }),
    prisma.pilotWing.count({
      where: { earnedAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } },
    }),
    prisma.pilotWing.count(),
  ]);

  if (definitions.length === 0 && totalAwards === 0) {
    return {
      totalBadges: 0,
      awarded30d: 0,
      awarded30dSubtext: "—",
      mostEarnedTitle: "—",
      mostEarnedSubtext: "—",
      rarestTitle: "—",
      rarestSubtext: "—",
      usingMockStats: false,
    };
  }

  const sortedByAwarded = [...definitions].sort(
    (a, b) => b.awardedCount - a.awardedCount,
  );
  const mostEarned = sortedByAwarded[0];
  const rarest =
    sortedByAwarded.filter((def) => def.awardedCount > 0).sort(
      (a, b) => a.awardedCount - b.awardedCount,
    )[0] ?? sortedByAwarded[sortedByAwarded.length - 1];

  return {
    totalBadges: definitions.length,
    awarded30d,
    awarded30dSubtext: growthSubtext(awarded30d, awardedPrev30d),
    mostEarnedTitle: mostEarned?.title ?? "—",
    mostEarnedSubtext: mostEarned
      ? `${mostEarned.awardedCount.toLocaleString()} pilots`
      : "—",
    rarestTitle: rarest?.title ?? "—",
    rarestSubtext: rarest
      ? `${rarest.awardedCount.toLocaleString()} holders`
      : "—",
    usingMockStats: totalAwards < 2,
  };
}
