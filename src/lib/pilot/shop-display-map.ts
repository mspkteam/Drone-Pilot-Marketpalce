import { homeAssets } from "@/lib/marketing/home-assets";
import type { UniformProductDto, UniformProductVariantDto } from "@/types/shop";

export type ShopDisplayProduct = {
  productId: string;
  name: string;
  category: string;
  imageSrc: string;
  variant: UniformProductVariantDto;
  displayPrice: number;
  variantCount: number;
};

export type ShopMockDisplayProduct = {
  id: string;
  name: string;
  category: string;
  imageSrc: string;
  displayPrice: number;
};

export const PILOT_SHOP_MOCK_DISPLAY: ShopMockDisplayProduct[] = [
  {
    id: "mock-epaulettes",
    name: "A-3 Senior Epaulettes",
    category: "INSIGNIA",
    imageSrc: homeAssets.ranks.a3,
    displayPrice: 45,
  },
  {
    id: "mock-patch",
    name: "Official Pilot Patch",
    category: "PATCHES",
    imageSrc: homeAssets.ranks.a2,
    displayPrice: 15,
  },
  {
    id: "mock-id",
    name: "Holographic Pilot ID Card",
    category: "ID",
    imageSrc: "/marketing/icon-trust-verified.png",
    displayPrice: 30,
  },
  {
    id: "mock-jacket",
    name: "Command Flight Jacket",
    category: "UNIFORM",
    imageSrc: "/marketing/hero-pilot.jpg",
    displayPrice: 240,
  },
  {
    id: "mock-cap",
    name: "Operations Cap",
    category: "UNIFORM",
    imageSrc: homeAssets.ranks.a1,
    displayPrice: 28,
  },
  {
    id: "mock-wings",
    name: "Digital Wings Badge NFT",
    category: "DIGITAL",
    imageSrc: homeAssets.ranks.a4,
    displayPrice: 0,
  },
];

function categoryFromProduct(product: UniformProductDto): string {
  const haystack = `${product.name} ${product.slug} ${product.description}`.toLowerCase();
  if (haystack.includes("patch")) return "PATCHES";
  if (haystack.includes("id card") || haystack.includes("id-card")) return "ID";
  if (haystack.includes("digital") || haystack.includes("nft") || haystack.includes("wings")) {
    return "DIGITAL";
  }
  if (haystack.includes("epaulette") || haystack.includes("insignia") || haystack.includes("rank")) {
    return "INSIGNIA";
  }
  return "UNIFORM";
}

function imageFromProduct(product: UniformProductDto): string {
  if (product.imageUrl) return product.imageUrl;

  const haystack = `${product.name} ${product.slug}`.toLowerCase();
  if (haystack.includes("epaulette") || haystack.includes("insignia")) return homeAssets.ranks.a3;
  if (haystack.includes("patch")) return homeAssets.ranks.a2;
  if (haystack.includes("id")) return "/marketing/icon-trust-verified.png";
  if (haystack.includes("jacket") || haystack.includes("polo")) return "/marketing/hero-pilot.jpg";
  if (haystack.includes("cap")) return homeAssets.ranks.a1;
  if (haystack.includes("wings") || haystack.includes("digital")) return homeAssets.ranks.a4;
  return homeAssets.ranks.a3;
}

export function pickPrimaryVariant(
  product: UniformProductDto,
): UniformProductVariantDto | null {
  return product.variants.find((variant) => variant.stockQuantity > 0) ?? product.variants[0] ?? null;
}

export function mapProductForDisplay(
  product: UniformProductDto,
): ShopDisplayProduct | null {
  const variant = pickPrimaryVariant(product);
  if (!variant) return null;

  return {
    productId: product.id,
    name: product.name,
    category: categoryFromProduct(product),
    imageSrc: imageFromProduct(product),
    variant,
    displayPrice: variant.price,
    variantCount: product.variants.length,
  };
}

export function formatShopPrice(amount: number): string {
  return `$${amount.toLocaleString(undefined, {
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

export function imageForVariant(
  variantId: string,
  displayProducts: ShopDisplayProduct[],
): string {
  const match = displayProducts.find((item) => item.variant.id === variantId);
  return match?.imageSrc ?? homeAssets.ranks.a3;
}
