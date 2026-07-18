import { homeAssets } from "@/lib/marketing/home-assets";
import { pickPrimaryVariant } from "@/lib/pilot/shop-display-map";
import type {
  AdminInventoryRowDto,
  AdminShopOrderCardDto,
  InventoryStockStatus,
} from "@/types/admin-shop";
import type { AdminUniformOrderDto, UniformProductDto } from "@/types/shop";

export const LOW_STOCK_THRESHOLD = 10;

function categoryFromProduct(product: UniformProductDto): string {
  const haystack = `${product.name} ${product.slug} ${product.description}`.toLowerCase();
  if (haystack.includes("patch")) return "PATCHES";
  if (haystack.includes("id card") || haystack.includes("id-card")) return "ID";
  if (haystack.includes("digital") || haystack.includes("nft")) return "DIGITAL";
  if (haystack.includes("epaulette") || haystack.includes("insignia") || haystack.includes("rank") || haystack.includes("badge") || haystack.includes("wing") || haystack.includes("pin")) {
    return "INSIGNIA";
  }
  if (haystack.includes("cap")) return "HEADWEAR";
  if (haystack.includes("jacket") || haystack.includes("suit") || haystack.includes("polo")) {
    return "UNIFORM";
  }
  return "UNIFORM";
}

function imageFromProduct(product: UniformProductDto): string {
  if (product.imageUrl) return product.imageUrl;

  const haystack = `${product.name} ${product.slug}`.toLowerCase();
  if (haystack.includes("epaulette") || haystack.includes("insignia") || haystack.includes("pin")) {
    return homeAssets.ranks.a3;
  }
  if (haystack.includes("patch")) return homeAssets.ranks.a2;
  if (haystack.includes("id")) return "/marketing/icon-trust-verified.png";
  if (haystack.includes("jacket") || haystack.includes("suit")) return "/marketing/hero-pilot.jpg";
  if (haystack.includes("cap")) return homeAssets.ranks.a1;
  return homeAssets.ranks.a3;
}

export function deriveStockStatus(
  stockQuantity: number,
  threshold = LOW_STOCK_THRESHOLD,
): InventoryStockStatus {
  if (stockQuantity <= 0) return "OUT_OF_STOCK";
  if (stockQuantity <= threshold) return "LOW_STOCK";
  return "IN_STOCK";
}

export function mapProductToInventoryRow(
  product: UniformProductDto,
  threshold = LOW_STOCK_THRESHOLD,
): AdminInventoryRowDto | null {
  const activeVariants = product.variants.filter((variant) => variant.isActive);
  if (activeVariants.length === 0 && product.variants.length === 0) return null;

  const variants = activeVariants.length > 0 ? activeVariants : product.variants;
  const totalStock = variants.reduce((sum, variant) => sum + variant.stockQuantity, 0);
  const primary = pickPrimaryVariant({ ...product, variants }) ?? variants[0];

  return {
    productId: product.id,
    variantId: primary?.id ?? null,
    name: product.name,
    sku: primary?.sku ?? "—",
    price: primary?.price ?? 0,
    stockQuantity: totalStock,
    stockLabel: `${totalStock.toLocaleString()} on hand`,
    status: deriveStockStatus(totalStock, threshold),
    category: categoryFromProduct(product),
    imageSrc: imageFromProduct(product),
    description: product.description,
    isActive: product.isActive,
    variantCount: variants.length,
    isMock: false,
  };
}

export function mapOrderToCard(order: AdminUniformOrderDto): AdminShopOrderCardDto {
  let statusTone: AdminShopOrderCardDto["statusTone"] = "neutral";
  let displayStatus = order.status.toUpperCase().replace(/_/g, " ");

  switch (order.status) {
    case "delivered":
      statusTone = "success";
      displayStatus = "DELIVERED";
      break;
    case "shipped":
      statusTone = "warning";
      displayStatus = "SHIPPED";
      break;
    case "processing":
    case "paid":
    case "pending_payment":
      statusTone = "warning";
      displayStatus = order.status === "pending_payment" ? "AWAITING PAYMENT" : "PROCESSING";
      break;
    case "cancelled":
      statusTone = "error";
      displayStatus = "CANCELLED";
      break;
  }

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    customerName: order.pilot.displayName,
    itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
    total: order.total,
    status: displayStatus,
    statusTone,
    isMock: false,
  };
}

export const MOCK_INVENTORY_ROWS: AdminInventoryRowDto[] = [
  {
    productId: "mock-flight-suit",
    variantId: null,
    name: "Standard Flight Suit",
    sku: "UNI-FLIGHT-01",
    price: 189,
    stockQuantity: 142,
    stockLabel: "142 on hand",
    status: "IN_STOCK",
    category: "UNIFORM",
    imageSrc: "/marketing/hero-pilot.jpg",
    description: "Official flight suit for platform pilots.",
    isActive: true,
    variantCount: 1,
    isMock: true,
  },
  {
    productId: "mock-squadron-cap",
    variantId: null,
    name: "Squadron Cap",
    sku: "UNI-CAP-04",
    price: 32,
    stockQuantity: 8,
    stockLabel: "8 on hand",
    status: "LOW_STOCK",
    category: "HEADWEAR",
    imageSrc: homeAssets.ranks.a1,
    description: "Operations cap with squadron insignia.",
    isActive: true,
    variantCount: 1,
    isMock: true,
  },
  {
    productId: "mock-wing-pin",
    variantId: null,
    name: "Wing Pin (Metal)",
    sku: "UNI-BADGE-WING",
    price: 18,
    stockQuantity: 540,
    stockLabel: "540 on hand",
    status: "IN_STOCK",
    category: "INSIGNIA",
    imageSrc: homeAssets.ranks.a3,
    description: "Metal wing pin for uniform display.",
    isActive: true,
    variantCount: 1,
    isMock: true,
  },
  {
    productId: "mock-aviator-jacket",
    variantId: null,
    name: "Aviator Jacket",
    sku: "UNI-JKT-02",
    price: 320,
    stockQuantity: 0,
    stockLabel: "0 on hand",
    status: "OUT_OF_STOCK",
    category: "UNIFORM",
    imageSrc: "/marketing/hero-pilot.jpg",
    description: "Premium aviator jacket.",
    isActive: true,
    variantCount: 1,
    isMock: true,
  },
];

export const MOCK_ORDER_CARDS: AdminShopOrderCardDto[] = [
  {
    id: "mock-ord-4421",
    orderNumber: "ORD-4421",
    customerName: "Marcus Vaughan",
    itemCount: 2,
    total: 221,
    status: "SHIPPED",
    statusTone: "warning",
    isMock: true,
  },
  {
    id: "mock-ord-4420",
    orderNumber: "ORD-4420",
    customerName: "Elara Vance",
    itemCount: 1,
    total: 189,
    status: "PROCESSING",
    statusTone: "warning",
    isMock: true,
  },
  {
    id: "mock-ord-4419",
    orderNumber: "ORD-4419",
    customerName: "Quinn Mendes",
    itemCount: 3,
    total: 68,
    status: "DELIVERED",
    statusTone: "success",
    isMock: true,
  },
];
