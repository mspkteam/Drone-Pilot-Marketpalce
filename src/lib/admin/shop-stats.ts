import { prisma } from "@/lib/db";
import { LOW_STOCK_THRESHOLD } from "@/lib/admin/shop-display";
import type { AdminShopStatsDto } from "@/types/admin-shop";

function growthSubtext(current: number, previous: number): string {
  if (previous <= 0) return current > 0 ? "+100%" : "—";
  const pct = Math.round(((current - previous) / previous) * 100);
  return pct >= 0 ? `+${pct}%` : `${pct}%`;
}

function buildMockStats(): AdminShopStatsDto {
  return {
    revenue30d: 28420,
    revenue30dSubtext: "+22%",
    orders30d: 184,
    lowStockSkus: 3,
    lowStockSubtext: "needs reorder",
    avgOrderValue: 154,
    usingMockStats: true,
  };
}

export async function getShopStatsForAdmin(): Promise<AdminShopStatsDto> {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  const [
    paidOrders30d,
    paidOrdersPrev30d,
    ordersPlaced30d,
    lowStockVariants,
    totalPaidOrders,
  ] = await Promise.all([
    prisma.uniformOrder.findMany({
      where: {
        paymentStatus: "paid",
        paidAt: { gte: thirtyDaysAgo },
      },
      select: { total: true },
    }),
    prisma.uniformOrder.findMany({
      where: {
        paymentStatus: "paid",
        paidAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
      },
      select: { total: true },
    }),
    prisma.uniformOrder.count({
      where: { placedAt: { gte: thirtyDaysAgo } },
    }),
    prisma.uniformProductVariant.count({
      where: {
        isActive: true,
        stockQuantity: { gt: 0, lte: LOW_STOCK_THRESHOLD },
      },
    }),
    prisma.uniformOrder.count({
      where: { paymentStatus: "paid" },
    }),
  ]);

  if (totalPaidOrders === 0 && ordersPlaced30d === 0) {
    return buildMockStats();
  }

  const revenue30d = paidOrders30d.reduce((sum, order) => sum + order.total, 0);
  const revenuePrev30d = paidOrdersPrev30d.reduce(
    (sum, order) => sum + order.total,
    0,
  );
  const avgOrderValue =
    paidOrders30d.length > 0
      ? Math.round(revenue30d / paidOrders30d.length)
      : 0;

  return {
    revenue30d: Math.round(revenue30d),
    revenue30dSubtext: growthSubtext(revenue30d, revenuePrev30d),
    orders30d: ordersPlaced30d,
    lowStockSkus: lowStockVariants,
    lowStockSubtext: lowStockVariants > 0 ? "needs reorder" : "healthy",
    avgOrderValue,
    usingMockStats: totalPaidOrders < 2,
  };
}

export async function getFulfillmentPercent(): Promise<number> {
  const [delivered, activeTotal] = await Promise.all([
    prisma.uniformOrder.count({ where: { status: "delivered" } }),
    prisma.uniformOrder.count({
      where: { status: { not: "cancelled" } },
    }),
  ]);

  if (activeTotal === 0) return 82;
  return Math.round((delivered / activeTotal) * 100);
}
