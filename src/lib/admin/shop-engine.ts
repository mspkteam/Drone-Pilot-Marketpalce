import {
  mapOrderToCard,
  mapProductToInventoryRow,
  MOCK_INVENTORY_ROWS,
  MOCK_ORDER_CARDS,
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

  const inventoryFromDb = products
    .map((product) => mapProductToInventoryRow(product))
    .filter((row): row is NonNullable<typeof row> => row !== null);

  const usingMockInventory = inventoryFromDb.length === 0;
  const inventory = usingMockInventory ? MOCK_INVENTORY_ROWS : inventoryFromDb;

  const usingMockOrders = orders.length === 0;
  const recentOrders = usingMockOrders
    ? MOCK_ORDER_CARDS
    : orders.slice(0, 5).map(mapOrderToCard);

  return {
    inventory,
    recentOrders,
    stats,
    fulfillmentPercent: orders.length === 0 ? 82 : fulfillmentPercent,
    usingMockInventory,
    usingMockOrders,
    rawOrders: orders,
  };
}
