import { prisma } from "@/lib/db";
import type { AdminCertificateStatsDto } from "@/types/admin-certificates";

function growthSubtext(current: number, previous: number): string {
  if (previous <= 0) {
    return current > 0 ? "+100% vs prior 30d" : "no change vs prior 30d";
  }
  const pct = Math.round(((current - previous) / previous) * 100);
  const sign = pct >= 0 ? "+" : "";
  return `${sign}${pct}% vs prior 30d`;
}

/** Real, database-derived certificate engine metrics (no mock values). */
export async function getCertificateStatsForAdmin(): Promise<AdminCertificateStatsDto> {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
  const yearStart = new Date(now.getFullYear(), 0, 1);

  const [
    activeTemplates,
    totalTemplates,
    totalIssued,
    issuedThisYear,
    issued30d,
    issuedPrev30d,
    distinctRecipients,
    approvedPilots,
  ] = await Promise.all([
    prisma.certificateTemplate.count({ where: { isActive: true } }),
    prisma.certificateTemplate.count(),
    prisma.pilotCertificate.count(),
    prisma.pilotCertificate.count({ where: { issuedAt: { gte: yearStart } } }),
    prisma.pilotCertificate.count({ where: { issuedAt: { gte: thirtyDaysAgo } } }),
    prisma.pilotCertificate.count({
      where: { issuedAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } },
    }),
    prisma.pilotCertificate.findMany({
      select: { pilotProfileId: true },
      distinct: ["pilotProfileId"],
    }),
    prisma.pilotProfile.count({ where: { status: "approved" } }),
  ]);

  const recipients = distinctRecipients.length;

  return {
    activeTemplates,
    activeTemplatesSubtext: `${totalTemplates.toLocaleString()} total`,
    totalIssued,
    totalIssuedSubtext: `${issuedThisYear.toLocaleString()} in ${now.getFullYear()}`,
    issued30d,
    issued30dSubtext: growthSubtext(issued30d, issuedPrev30d),
    recipients,
    recipientsSubtext: `of ${approvedPilots.toLocaleString()} approved pilots`,
  };
}
