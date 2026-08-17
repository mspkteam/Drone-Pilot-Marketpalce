import { homeAssets } from "@/lib/marketing/home-assets";
import { LIVE_MEMBERSHIP_TIER_DEFINITIONS } from "@/lib/membership/tiers";
import type { UniformProductDto, UniformProductVariantDto } from "@/types/shop";

export type ShopDisplayProduct = {
  productId: string;
  name: string;
  category: string;
  description: string;
  imageSrc: string;
  imageUrls: string[];
  variants: UniformProductVariantDto[];
  variant: UniformProductVariantDto;
  displayPrice: number;
  variantCount: number;
  eligible: boolean;
  lockLabel: string | null;
  configurable: boolean;
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

export function shopUnlockLabel(minTierCode: string | null | undefined): string | null {
  if (!minTierCode) return null;
  const tier = LIVE_MEMBERSHIP_TIER_DEFINITIONS.find((item) => item.code === minTierCode);
  if (!tier) return `UNLOCKED AT ${minTierCode.replaceAll("_", " ")}`;
  return `UNLOCKED AT ${tier.name}`.toUpperCase();
}

function isConfigurableProduct(product: UniformProductDto): boolean {
  const haystack = `${product.name} ${product.slug} ${product.description}`.toLowerCase();
  return haystack.includes("polo") || haystack.includes("customize");
}

function categoryFromProduct(product: UniformProductDto): string {
  const haystack = `${product.name} ${product.slug} ${product.description}`.toLowerCase();
  if (haystack.includes("patch")) return "PATCHES";
  if (haystack.includes("id card") || haystack.includes("id-card")) return "ID";
  if (
    haystack.includes("digital") ||
    haystack.includes("nft") ||
    haystack.includes("polo") ||
    haystack.includes("wings")
  ) {
    return "DIGITAL";
  }
  if (haystack.includes("epaulette") || haystack.includes("insignia") || haystack.includes("rank")) {
    return "INSIGNIA";
  }
  return "UNIFORM";
}

const FIGMA_SHOP_IMAGES: Record<string, string> = {
  epaulette: "/shop/epaulettes.png",
  insignia: "/shop/epaulettes.png",
  id: "/shop/pilot-id.png",
  jacket: "/shop/flight-shirt.png",
  polo: "/shop/pilot-wings.png",
  wings: "/shop/pilot-wings.png",
};

function imageFromProduct(product: UniformProductDto): string {
  if (product.images.length > 0) return product.images[0]!.url;
  if (product.imageUrl) return product.imageUrl;

  const haystack = `${product.name} ${product.slug}`.toLowerCase();
  if (haystack.includes("patch") || haystack.includes("cap")) return "";
  for (const [key, src] of Object.entries(FIGMA_SHOP_IMAGES)) {
    if (haystack.includes(key)) return src;
  }
  return homeAssets.ranks.a3;
}

function imagesFromProduct(product: UniformProductDto): string[] {
  if (product.images.length > 0) {
    return product.images.map((img) => img.url);
  }
  const fallback = imageFromProduct(product);
  return fallback ? [fallback] : [];
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
    description: product.description?.trim() ?? "",
    imageSrc: imageFromProduct(product),
    imageUrls: imagesFromProduct(product),
    variants: product.variants,
    variant,
    displayPrice: variant.price,
    variantCount: product.variants.length,
    eligible: product.eligible !== false,
    lockLabel: shopUnlockLabel(product.minTierCode),
    configurable: isConfigurableProduct(product),
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
  const match = displayProducts.find((item) =>
    item.variants.some((v) => v.id === variantId),
  );
  return match?.imageSrc ?? homeAssets.ranks.a3;
}

export function uniqueVariantValues(
  variants: UniformProductVariantDto[],
  field: "size" | "color",
): string[] {
  const values = new Set<string>();
  for (const variant of variants) {
    const value = variant[field]?.trim();
    if (value) values.add(value);
  }
  return Array.from(values);
}

export function resolveVariant(
  variants: UniformProductVariantDto[],
  size: string | null,
  color: string | null,
): UniformProductVariantDto | null {
  const active = variants.filter((v) => v.isActive);
  if (!active.length) return null;

  const matches = active.filter((v) => {
    if (size && v.size?.trim() !== size) return false;
    if (color && v.color?.trim() !== color) return false;
    return true;
  });

  return (
    matches.find((v) => v.stockQuantity > 0) ??
    matches[0] ??
    active.find((v) => v.stockQuantity > 0) ??
    active[0] ??
    null
  );
}
