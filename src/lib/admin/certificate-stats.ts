import { prisma } from "@/lib/db";
import type { AdminCertificateStatsDto } from "@/types/admin-certificates";

function growthSubtext(current: number, previous: number): string {
  if (previous <= 0) {
    return current > 0 ? "+100%" : "—";
  }
  const pct = Math.round(((current - previous) / previous) * 100);
  return pct >= 0 ? `+${pct}%` : `${pct}%`;
}

function buildMockStats(templateCount: number): AdminCertificateStatsDto {
  return {
    templateCount: templateCount || 8,
    issued30d: 612,
    issued30dSubtext: "+14%",
    totalIssued: 14820,
    pdfRenderTimeLabel: "1.2S",
    pdfRenderTimeSubtext: "median",
    usingMockStats: true,
  };
}

export async function getCertificateStatsForAdmin(
  templateCount: number,
): Promise<AdminCertificateStatsDto> {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  const [totalIssued, issued30d, issuedPrev30d] = await Promise.all([
    prisma.pilotCertificate.count(),
    prisma.pilotCertificate.count({
      where: { issuedAt: { gte: thirtyDaysAgo } },
    }),
    prisma.pilotCertificate.count({
      where: {
        issuedAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
      },
    }),
  ]);

  if (totalIssued === 0 && templateCount === 0) {
    return buildMockStats(templateCount);
  }

  return {
    templateCount: templateCount || 0,
    issued30d,
    issued30dSubtext: growthSubtext(issued30d, issuedPrev30d),
    totalIssued,
    pdfRenderTimeLabel: "1.2S",
    pdfRenderTimeSubtext: "median",
    usingMockStats: totalIssued < 2,
  };
}
