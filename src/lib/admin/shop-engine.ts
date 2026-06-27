import {
  mapOrderToCard,
  mapProductToInventoryRow,
} from "@/lib/admin/shop-display";
import { getFulfillmentPercent, getShopStatsForAdmin } from "@/lib/admin/shop-stats";
import { listOrdersForAdmin, listProductsForAdmin } from "@/lib/shop/shop";
import type { AdminShopEngineDataDto } from "@/types/admin-shop";

export async function getAdminShopEngineData(): Promise<AdminShopEngineDataDto> {
  const [products, orders, stats, fulfillmentPercent] = await Promise.all([
    listProductsForAdmin(),
    listOrdersForAdmin("all"),
    getShopStatsForAdmin(),
    getFulfillmentPercent(),
  ]);

  const inventory = products
    .map((product) => mapProductToInventoryRow(product))
    .filter((row): row is NonNullable<typeof row> => row !== null);

  const recentOrders = orders.slice(0, 5).map(mapOrderToCard);

  return {
    inventory,
    recentOrders,
    stats,
    fulfillmentPercent: orders.length === 0 ? 0 : fulfillmentPercent,
    usingMockInventory: false,
    usingMockOrders: false,
    rawOrders: orders,
  };
}
