import type { AdminUniformOrderDto } from "@/types/shop";

export type InventoryStockStatus = "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";

export type AdminInventoryRowDto = {
  productId: string;
  variantId: string | null;
  name: string;
  sku: string;
  price: number;
  stockQuantity: number;
  stockLabel: string;
  status: InventoryStockStatus;
  category: string;
  imageSrc: string;
  imageUrls: string[];
  description: string;
  isActive: boolean;
  variantCount: number;
  variants: Array<{
    id: string;
    sku: string;
    label: string;
    size: string | null;
    color: string | null;
    price: number;
    stockQuantity: number;
    isActive: boolean;
  }>;
  isMock?: boolean;
};

export type AdminShopOrderCardDto = {
  id: string;
  orderNumber: string;
  customerName: string;
  itemCount: number;
  total: number;
  status: string;
  statusTone: "success" | "warning" | "error" | "neutral";
  isMock?: boolean;
};

export type AdminShopStatsDto = {
  revenue30d: number;
  revenue30dSubtext: string;
  orders30d: number;
  lowStockSkus: number;
  lowStockSubtext: string;
  avgOrderValue: number;
  usingMockStats: boolean;
};

export type AdminShopEngineDataDto = {
  inventory: AdminInventoryRowDto[];
  recentOrders: AdminShopOrderCardDto[];
  stats: AdminShopStatsDto;
  fulfillmentPercent: number;
  usingMockInventory: boolean;
  usingMockOrders: boolean;
  rawOrders: AdminUniformOrderDto[];
};

export type ShopVariantFormInput = {
  id?: string;
  sku: string;
  label: string;
  size: string;
  color: string;
  price: number;
  stockQuantity: number;
  isActive?: boolean;
};

export type ShopProductFormInput = {
  name: string;
  category: string;
  description: string;
  imageUrls: string[];
  isActive: boolean;
  isDigital: boolean;
  isVariable: boolean;
  /** Base price when simple product; ignored when variable (per-variant prices). */
  price: number;
  stockQuantity: number;
  stockThreshold: number;
  sku: string;
  variants: ShopVariantFormInput[];
};
