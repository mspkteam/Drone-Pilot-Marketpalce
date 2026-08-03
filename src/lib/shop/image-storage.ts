import {
  SHOP_IMAGE_MAX_BYTES,
  SHOP_IMAGES_PER_PRODUCT_MAX,
} from "@/lib/shop/constants";
import { writePublicAsset } from "@/lib/storage/public-asset";

/** Product gallery images — Blob when configured, else /public/shop/products */

export { SHOP_IMAGE_MAX_BYTES, SHOP_IMAGES_PER_PRODUCT_MAX };
const SHOP_IMAGE_EXT_BY_MIME: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

export function isAllowedShopImageMime(mime: string): boolean {
  return mime in SHOP_IMAGE_EXT_BY_MIME;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

export function validateShopProductImage(
  buffer: Buffer,
  mime: string,
): { ok: true } | { ok: false; error: string } {
  if (buffer.length === 0) {
    return { ok: false, error: "File is empty." };
  }
  if (buffer.length > SHOP_IMAGE_MAX_BYTES) {
    return {
      ok: false,
      error: `Image must be ${SHOP_IMAGE_MAX_BYTES / (1024 * 1024)} MB or smaller.`,
    };
  }
  if (!isAllowedShopImageMime(mime)) {
    return { ok: false, error: "Allowed types: PNG, JPEG, or WebP." };
  }
  return { ok: true };
}

export async function writeShopProductImage(
  buffer: Buffer,
  mime: string,
  nameHint?: string | null,
): Promise<string> {
  const ext = SHOP_IMAGE_EXT_BY_MIME[mime] ?? "jpg";
  const base =
    nameHint && slugify(nameHint)
      ? `${slugify(nameHint)}-${Date.now()}`
      : `product-${Date.now()}`;
  const fileName = `${base}.${ext}`;
  return writePublicAsset({
    folder: "shop/products",
    fileName,
    buffer,
    contentType: mime,
  });
}
