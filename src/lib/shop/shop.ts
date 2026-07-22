import type {
  UniformOrder,
  UniformOrderItem,
  UniformProduct,
  UniformProductImage,
  UniformProductVariant,
} from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { notifyAsync, sendNotification } from "@/lib/notifications/notify";
import { SHOP_IMAGES_PER_PRODUCT_MAX } from "@/lib/shop/constants";
import { UNIFORM_SHIPPING_FLAT_RATE } from "@/lib/shop/constants";
import type {
  AdminUniformOrderDto,
  UniformOrderDto,
  UniformOrderItemDto,
  UniformOrderStatus,
  UniformPaymentStatus,
  UniformProductDto,
  UniformProductImageDto,
  UniformProductVariantDto,
} from "@/types/shop";
import {
  UNIFORM_ORDER_STATUSES,
  UNIFORM_PAYMENT_STATUSES,
} from "@/types/shop";

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function generateUniformOrderNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `UNI-${year}-`;
  const latest = await prisma.uniformOrder.findFirst({
    where: { orderNumber: { startsWith: prefix } },
    orderBy: { orderNumber: "desc" },
  });

  let seq = 1;
  if (latest) {
    const part = latest.orderNumber.slice(prefix.length);
    const n = parseInt(part, 10);
    if (!Number.isNaN(n)) seq = n + 1;
  }

  return `${prefix}${String(seq).padStart(6, "0")}`;
}

function toImageDto(img: UniformProductImage): UniformProductImageDto {
  return {
    id: img.id,
    url: img.url,
    alt: img.alt,
    sortOrder: img.sortOrder,
  };
}

function toVariantDto(v: UniformProductVariant): UniformProductVariantDto {
  return {
    id: v.id,
    productId: v.productId,
    sku: v.sku,
    label: v.label,
    size: v.size,
    color: v.color,
    price: v.price,
    stockQuantity: v.stockQuantity,
    isActive: v.isActive,
  };
}

function toProductDto(
  p: UniformProduct & {
    variants: UniformProductVariant[];
    images?: UniformProductImage[];
  },
): UniformProductDto {
  const images = (p.images ?? []).map(toImageDto).sort((a, b) => a.sortOrder - b.sortOrder);
  const primaryImage = images[0]?.url ?? p.imageUrl;
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    imageUrl: primaryImage,
    images,
    isActive: p.isActive,
    sortOrder: p.sortOrder,
    variants: p.variants
      .filter((v) => v.isActive)
      .map(toVariantDto),
  };
}

function toProductDtoAdmin(
  p: UniformProduct & {
    variants: UniformProductVariant[];
    images?: UniformProductImage[];
  },
): UniformProductDto {
  const images = (p.images ?? []).map(toImageDto).sort((a, b) => a.sortOrder - b.sortOrder);
  const primaryImage = images[0]?.url ?? p.imageUrl;
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    imageUrl: primaryImage,
    images,
    isActive: p.isActive,
    sortOrder: p.sortOrder,
    variants: p.variants.map(toVariantDto),
  };
}

const productInclude = {
  variants: { orderBy: { label: "asc" as const } },
  images: { orderBy: { sortOrder: "asc" as const } },
};

export type ShopVariantSyncInput = {
  id?: string;
  sku: string;
  label: string;
  size?: string | null;
  color?: string | null;
  price: number;
  stockQuantity: number;
  isActive?: boolean;
};

export async function syncProductImages(
  productId: string,
  imageUrls: string[],
): Promise<void> {
  const urls = imageUrls
    .map((u) => u.trim())
    .filter(Boolean)
    .slice(0, SHOP_IMAGES_PER_PRODUCT_MAX);

  await prisma.uniformProductImage.deleteMany({ where: { productId } });
  if (urls.length) {
    await prisma.uniformProductImage.createMany({
      data: urls.map((url, index) => ({
        productId,
        url,
        sortOrder: index,
      })),
    });
  }

  await prisma.uniformProduct.update({
    where: { id: productId },
    data: { imageUrl: urls[0] ?? null },
  });
}

export async function syncProductVariants(
  productId: string,
  variants: ShopVariantSyncInput[],
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!variants.length) {
    return { ok: false, error: "At least one size/color variant is required." };
  }

  const existing = await prisma.uniformProductVariant.findMany({
    where: { productId },
  });
  const existingIds = new Set(existing.map((v) => v.id));
  const incomingIds = new Set(
    variants.map((v) => v.id).filter((id): id is string => Boolean(id)),
  );

  for (const row of variants) {
    const sku = row.sku.trim().toUpperCase();
    const label = row.label.trim();
    if (!sku || !label || row.price <= 0) {
      return { ok: false, error: "Each variant needs SKU, label, and a positive price." };
    }

    if (row.id && existingIds.has(row.id)) {
      const dup = await prisma.uniformProductVariant.findFirst({
        where: { sku, NOT: { id: row.id } },
      });
      if (dup) {
        return { ok: false, error: `SKU ${sku} is already in use.` };
      }
      await prisma.uniformProductVariant.update({
        where: { id: row.id },
        data: {
          sku,
          label,
          size: row.size?.trim() || null,
          color: row.color?.trim() || null,
          price: row.price,
          stockQuantity: Math.max(0, row.stockQuantity),
          isActive: row.isActive ?? true,
        },
      });
    } else {
      const dup = await prisma.uniformProductVariant.findUnique({ where: { sku } });
      if (dup) {
        return { ok: false, error: `SKU ${sku} is already in use.` };
      }
      await prisma.uniformProductVariant.create({
        data: {
          productId,
          sku,
          label,
          size: row.size?.trim() || null,
          color: row.color?.trim() || null,
          price: row.price,
          stockQuantity: Math.max(0, row.stockQuantity),
          isActive: row.isActive ?? true,
        },
      });
    }
  }

  for (const old of existing) {
    if (!incomingIds.has(old.id)) {
      await prisma.uniformProductVariant.update({
        where: { id: old.id },
        data: { isActive: false },
      });
    }
  }

  return { ok: true };
}

function toItemDto(item: UniformOrderItem): UniformOrderItemDto {
  return {
    id: item.id,
    variantId: item.variantId,
    productName: item.productName,
    variantLabel: item.variantLabel,
    sku: item.sku,
    unitPrice: item.unitPrice,
    quantity: item.quantity,
    lineTotal: item.lineTotal,
  };
}

function toOrderDto(
  order: UniformOrder & { items: UniformOrderItem[] },
): UniformOrderDto {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    userId: order.userId,
    status: order.status as UniformOrderStatus,
    paymentStatus: order.paymentStatus as UniformPaymentStatus,
    currency: order.currency,
    subtotal: order.subtotal,
    shippingAmount: order.shippingAmount,
    total: order.total,
    shippingName: order.shippingName,
    shippingLine1: order.shippingLine1,
    shippingLine2: order.shippingLine2,
    shippingCity: order.shippingCity,
    shippingRegion: order.shippingRegion,
    shippingPostal: order.shippingPostal,
    shippingCountry: order.shippingCountry,
    shippingPhone: order.shippingPhone,
    notes: order.notes,
    placedAt: order.placedAt.toISOString(),
    paidAt: order.paidAt?.toISOString() ?? null,
    shippedAt: order.shippedAt?.toISOString() ?? null,
    deliveredAt: order.deliveredAt?.toISOString() ?? null,
    cancelledAt: order.cancelledAt?.toISOString() ?? null,
    items: order.items.map(toItemDto),
  };
}

export async function listActiveProductsForShop(): Promise<UniformProductDto[]> {
  const rows = await prisma.uniformProduct.findMany({
    where: { isActive: true },
    include: {
      ...productInclude,
      variants: {
        where: { isActive: true },
        orderBy: { label: "asc" },
      },
    },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
  return rows.map(toProductDto);
}

export async function listProductsForAdmin(): Promise<UniformProductDto[]> {
  const rows = await prisma.uniformProduct.findMany({
    include: productInclude,
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
  return rows.map(toProductDtoAdmin);
}

export async function getProductForAdmin(
  id: string,
): Promise<UniformProductDto | null> {
  const row = await prisma.uniformProduct.findUnique({
    where: { id },
    include: productInclude,
  });
  return row ? toProductDtoAdmin(row) : null;
}

export async function createProduct(input: {
  name: string;
  description: string;
  imageUrls?: string[];
  imageUrl?: string | null;
  sortOrder?: number;
  isActive?: boolean;
  variants?: ShopVariantSyncInput[];
  variant?: {
    sku: string;
    label: string;
    size?: string | null;
    color?: string | null;
    price: number;
    stockQuantity: number;
  };
}): Promise<
  | { ok: true; product: UniformProductDto }
  | { ok: false; error: string }
> {
  const name = input.name.trim();
  const description = input.description.trim();
  if (!name || description.length < 10) {
    return {
      ok: false,
      error: "Name and description (min 10 chars) are required.",
    };
  }

  const slug = slugify(name);
  const existing = await prisma.uniformProduct.findUnique({ where: { slug } });
  if (existing) {
    return { ok: false, error: "Product slug already exists." };
  }

  const imageUrls =
    input.imageUrls?.filter((u) => u.trim()) ??
    (input.imageUrl?.trim() ? [input.imageUrl.trim()] : []);

  const row = await prisma.uniformProduct.create({
    data: {
      name,
      slug,
      description,
      imageUrl: imageUrls[0] ?? null,
      sortOrder: input.sortOrder ?? 0,
      isActive: input.isActive ?? true,
      images: imageUrls.length
        ? {
            create: imageUrls.map((url, index) => ({
              url,
              sortOrder: index,
            })),
          }
        : undefined,
    },
    include: productInclude,
  });

  if (input.variants?.length) {
    const sync = await syncProductVariants(row.id, input.variants);
    if (!sync.ok) {
      await prisma.uniformProduct.delete({ where: { id: row.id } });
      return sync;
    }
  } else if (input.variant) {
    const v = input.variant;
    const dup = await prisma.uniformProductVariant.findUnique({
      where: { sku: v.sku.trim().toUpperCase() },
    });
    if (dup) {
      await prisma.uniformProduct.delete({ where: { id: row.id } });
      return { ok: false, error: "SKU already exists." };
    }
    await prisma.uniformProductVariant.create({
      data: {
        productId: row.id,
        sku: v.sku.trim().toUpperCase(),
        label: v.label.trim(),
        size: v.size?.trim() || null,
        color: v.color?.trim() || null,
        price: v.price,
        stockQuantity: Math.max(0, v.stockQuantity),
        isActive: true,
      },
    });
  }

  const refreshed = await prisma.uniformProduct.findUnique({
    where: { id: row.id },
    include: productInclude,
  });
  if (!refreshed) {
    return { ok: false, error: "Product create failed." };
  }

  return { ok: true, product: toProductDtoAdmin(refreshed) };
}

export async function createVariant(
  productId: string,
  input: {
    sku: string;
    label: string;
    size?: string | null;
    color?: string | null;
    price: number;
    stockQuantity: number;
  },
): Promise<
  | { ok: true; variant: UniformProductVariantDto }
  | { ok: false; error: string; status?: 404 }
> {
  const product = await prisma.uniformProduct.findUnique({
    where: { id: productId },
  });
  if (!product) {
    return { ok: false, error: "Product not found.", status: 404 };
  }

  const sku = input.sku.trim().toUpperCase();
  const label = input.label.trim();
  if (!sku || !label || input.price <= 0) {
    return { ok: false, error: "SKU, label, and positive price required." };
  }

  const dup = await prisma.uniformProductVariant.findUnique({ where: { sku } });
  if (dup) {
    return { ok: false, error: "SKU already exists." };
  }

  const row = await prisma.uniformProductVariant.create({
    data: {
      productId,
      sku,
      label,
      size: input.size?.trim() || null,
      color: input.color?.trim() || null,
      price: input.price,
      stockQuantity: Math.max(0, input.stockQuantity),
      isActive: true,
    },
  });

  return { ok: true, variant: toVariantDto(row) };
}

export async function updateProduct(
  id: string,
  input: Partial<{
    name: string;
    description: string;
    imageUrl: string | null;
    imageUrls: string[];
    sortOrder: number;
    isActive: boolean;
    price: number;
    stockQuantity: number;
    sku: string;
    variants: ShopVariantSyncInput[];
  }>,
): Promise<
  | { ok: true; product: UniformProductDto }
  | { ok: false; error: string; status?: 404 }
> {
  const existing = await prisma.uniformProduct.findUnique({
    where: { id },
    include: productInclude,
  });
  if (!existing) {
    return { ok: false, error: "Product not found.", status: 404 };
  }

  if (input.price !== undefined && (!Number.isFinite(input.price) || input.price <= 0)) {
    return { ok: false, error: "Price must be a positive number." };
  }

  await prisma.uniformProduct.update({
    where: { id },
    data: {
      ...(input.name !== undefined ? { name: input.name.trim() } : {}),
      ...(input.description !== undefined
        ? { description: input.description.trim() }
        : {}),
      ...(input.imageUrl !== undefined
        ? { imageUrl: input.imageUrl?.trim() || null }
        : {}),
      ...(input.sortOrder !== undefined ? { sortOrder: input.sortOrder } : {}),
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
    },
  });

  if (input.imageUrls !== undefined) {
    await syncProductImages(id, input.imageUrls);
  }

  if (input.variants !== undefined) {
    const sync = await syncProductVariants(id, input.variants);
    if (!sync.ok) {
      return { ok: false, error: sync.error };
    }
  } else if (input.price !== undefined) {
    if (existing.variants.length > 0) {
      await prisma.uniformProductVariant.updateMany({
        where: { productId: id, isActive: true },
        data: { price: input.price },
      });
    } else {
      const sku =
        input.sku?.trim().toUpperCase() ||
        `${slugify(input.name ?? existing.name).toUpperCase().replace(/-/g, "")}-STD`;
      const dup = await prisma.uniformProductVariant.findUnique({ where: { sku } });
      if (dup) {
        return { ok: false, error: "SKU already exists — set a unique SKU." };
      }
      await prisma.uniformProductVariant.create({
        data: {
          productId: id,
          sku,
          label: (input.name ?? existing.name).trim(),
          price: input.price,
          stockQuantity:
            input.stockQuantity !== undefined
              ? Math.max(0, input.stockQuantity)
              : 0,
          isActive: true,
        },
      });
    }
  }

  if (
    input.stockQuantity !== undefined &&
    input.variants === undefined &&
    existing.variants.filter((v) => v.isActive).length === 1
  ) {
    const active = existing.variants.find((v) => v.isActive) ?? existing.variants[0];
    if (active) {
      await prisma.uniformProductVariant.update({
        where: { id: active.id },
        data: { stockQuantity: Math.max(0, input.stockQuantity) },
      });
    }
  }

  const row = await prisma.uniformProduct.findUnique({
    where: { id },
    include: productInclude,
  });
  if (!row) {
    return { ok: false, error: "Product not found.", status: 404 };
  }

  return { ok: true, product: toProductDtoAdmin(row) };
}

export async function updateVariant(
  id: string,
  input: Partial<{
    label: string;
    size: string | null;
    color: string | null;
    price: number;
    stockQuantity: number;
    isActive: boolean;
  }>,
): Promise<
  | { ok: true; variant: UniformProductVariantDto }
  | { ok: false; error: string; status?: 404 }
> {
  const existing = await prisma.uniformProductVariant.findUnique({
    where: { id },
  });
  if (!existing) {
    return { ok: false, error: "Variant not found.", status: 404 };
  }

  const row = await prisma.uniformProductVariant.update({
    where: { id },
    data: {
      ...(input.label !== undefined ? { label: input.label.trim() } : {}),
      ...(input.size !== undefined ? { size: input.size?.trim() || null } : {}),
      ...(input.color !== undefined ? { color: input.color?.trim() || null } : {}),
      ...(input.price !== undefined ? { price: input.price } : {}),
      ...(input.stockQuantity !== undefined
        ? { stockQuantity: Math.max(0, input.stockQuantity) }
        : {}),
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
    },
  });

  return { ok: true, variant: toVariantDto(row) };
}

type CartLineInput = { variantId: string; quantity: number };

type ShippingInput = {
  shippingName: string;
  shippingLine1: string;
  shippingLine2?: string | null;
  shippingCity: string;
  shippingRegion?: string | null;
  shippingPostal: string;
  shippingCountry?: string;
  shippingPhone?: string | null;
  notes?: string | null;
};

export async function placeUniformOrder(
  userId: string,
  lines: CartLineInput[],
  shipping: ShippingInput,
): Promise<
  | { ok: true; order: UniformOrderDto }
  | { ok: false; error: string; status: 400 }
> {
  if (!lines.length) {
    return { ok: false, error: "Cart is empty.", status: 400 };
  }

  const name = shipping.shippingName.trim();
  const line1 = shipping.shippingLine1.trim();
  const city = shipping.shippingCity.trim();
  const postal = shipping.shippingPostal.trim();
  if (!name || !line1 || !city || !postal) {
    return {
      ok: false,
      error: "Shipping name, address, city, and postal code are required.",
      status: 400,
    };
  }

  const variantIds = lines.map((l) => l.variantId);
  const variants = await prisma.uniformProductVariant.findMany({
    where: {
      id: { in: variantIds },
      isActive: true,
      product: { isActive: true },
    },
    include: { product: true },
  });

  if (variants.length !== variantIds.length) {
    return { ok: false, error: "One or more items are unavailable.", status: 400 };
  }

  const variantMap = new Map(variants.map((v) => [v.id, v]));
  let subtotal = 0;
  const itemRows: {
    variantId: string;
    productName: string;
    variantLabel: string;
    sku: string;
    unitPrice: number;
    quantity: number;
    lineTotal: number;
  }[] = [];

  for (const line of lines) {
    const qty = Math.floor(line.quantity);
    if (qty < 1) {
      return { ok: false, error: "Invalid quantity.", status: 400 };
    }
    const variant = variantMap.get(line.variantId);
    if (!variant) {
      return { ok: false, error: "Invalid variant.", status: 400 };
    }
    if (variant.stockQuantity < qty) {
      return {
        ok: false,
        error: `Insufficient stock for ${variant.label}.`,
        status: 400,
      };
    }
    const lineTotal = variant.price * qty;
    subtotal += lineTotal;
    itemRows.push({
      variantId: variant.id,
      productName: variant.product.name,
      variantLabel: variant.label,
      sku: variant.sku,
      unitPrice: variant.price,
      quantity: qty,
      lineTotal,
    });
  }

  const shippingAmount = UNIFORM_SHIPPING_FLAT_RATE;
  const total = subtotal + shippingAmount;
  const orderNumber = await generateUniformOrderNumber();

  const order = await prisma.$transaction(async (tx) => {
    for (const line of lines) {
      const qty = Math.floor(line.quantity);
      const updated = await tx.uniformProductVariant.updateMany({
        where: {
          id: line.variantId,
          stockQuantity: { gte: qty },
        },
        data: { stockQuantity: { decrement: qty } },
      });
      if (updated.count === 0) {
        throw new Error("STOCK");
      }
    }

    return tx.uniformOrder.create({
      data: {
        orderNumber,
        userId,
        status: "pending_payment",
        paymentStatus: "pending",
        subtotal,
        shippingAmount,
        total,
        shippingName: name,
        shippingLine1: line1,
        shippingLine2: shipping.shippingLine2?.trim() || null,
        shippingCity: city,
        shippingRegion: shipping.shippingRegion?.trim() || null,
        shippingPostal: postal,
        shippingCountry: shipping.shippingCountry?.trim() || "United States",
        shippingPhone: shipping.shippingPhone?.trim() || null,
        notes: shipping.notes?.trim() || null,
        items: {
          create: itemRows,
        },
      },
      include: { items: true },
    });
  }).catch(() => null);

  if (!order) {
    return {
      ok: false,
      error: "Could not place order — stock may have changed.",
      status: 400,
    };
  }

  notifyAsync(async () => {
    await sendNotification({
      userId,
      type: "welcome",
      title: "Uniform order placed",
      body: `Order ${orderNumber} is awaiting payment ($${total.toFixed(2)}).`,
      payload: { orderId: order.id },
    });
  });

  return { ok: true, order: toOrderDto(order) };
}

export async function payUniformOrder(
  orderId: string,
  userId: string,
): Promise<
  | { ok: true; order: UniformOrderDto }
  | { ok: false; error: string; status: 400 | 403 | 404 }
> {
  const order = await prisma.uniformOrder.findFirst({
    where: { id: orderId, userId },
    include: { items: true },
  });

  if (!order) {
    return { ok: false, error: "Order not found.", status: 404 };
  }

  if (order.status !== "pending_payment" || order.paymentStatus !== "pending") {
    return {
      ok: false,
      error: "Order is not awaiting payment.",
      status: 400,
    };
  }

  const now = new Date();
  const updated = await prisma.uniformOrder.update({
    where: { id: orderId },
    data: {
      status: "paid",
      paymentStatus: "paid",
      paidAt: now,
    },
    include: { items: true },
  });

  notifyAsync(async () => {
    await sendNotification({
      userId,
      type: "welcome",
      title: "Uniform order paid",
      body: `Payment received for ${order.orderNumber}. We will process your order soon.`,
      payload: { orderId },
    });
  });

  return { ok: true, order: toOrderDto(updated) };
}

export async function listOrdersForUser(userId: string): Promise<UniformOrderDto[]> {
  const rows = await prisma.uniformOrder.findMany({
    where: { userId },
    include: { items: true },
    orderBy: { placedAt: "desc" },
  });
  return rows.map(toOrderDto);
}

export async function getOrderForUser(
  orderId: string,
  userId: string,
): Promise<UniformOrderDto | null> {
  const row = await prisma.uniformOrder.findFirst({
    where: { id: orderId, userId },
    include: { items: true },
  });
  return row ? toOrderDto(row) : null;
}

export async function listOrdersForAdmin(
  filter?: UniformOrderStatus | "all",
): Promise<AdminUniformOrderDto[]> {
  const where =
    filter && filter !== "all" ? { status: filter } : undefined;

  const rows = await prisma.uniformOrder.findMany({
    where,
    include: {
      items: true,
      user: {
        select: {
          email: true,
          pilotProfile: { select: { displayName: true } },
        },
      },
    },
    orderBy: { placedAt: "desc" },
  });

  return rows.map((r) => ({
    ...toOrderDto(r),
    pilot: {
      displayName: r.user.pilotProfile?.displayName ?? r.user.email,
      email: r.user.email,
    },
  }));
}

export async function updateOrderByAdmin(
  orderId: string,
  input: {
    status?: string;
    paymentStatus?: string;
  },
): Promise<
  | { ok: true; order: AdminUniformOrderDto }
  | { ok: false; error: string; status: 400 | 404 }
> {
  const order = await prisma.uniformOrder.findUnique({
    where: { id: orderId },
    include: {
      items: true,
      user: {
        select: {
          id: true,
          email: true,
          pilotProfile: { select: { displayName: true } },
        },
      },
    },
  });

  if (!order) {
    return { ok: false, error: "Order not found.", status: 404 };
  }

  if (
    input.status &&
    !UNIFORM_ORDER_STATUSES.includes(input.status as UniformOrderStatus)
  ) {
    return { ok: false, error: "Invalid order status.", status: 400 };
  }

  if (
    input.paymentStatus &&
    !UNIFORM_PAYMENT_STATUSES.includes(
      input.paymentStatus as UniformPaymentStatus,
    )
  ) {
    return { ok: false, error: "Invalid payment status.", status: 400 };
  }

  const now = new Date();
  const data: Record<string, unknown> = {};

  if (input.status) {
    data.status = input.status;
    if (input.status === "shipped" && !order.shippedAt) {
      data.shippedAt = now;
    }
    if (input.status === "delivered" && !order.deliveredAt) {
      data.deliveredAt = now;
    }
    if (input.status === "cancelled" && !order.cancelledAt) {
      data.cancelledAt = now;
    }
  }

  if (input.paymentStatus) {
    data.paymentStatus = input.paymentStatus;
    if (input.paymentStatus === "paid" && !order.paidAt) {
      data.paidAt = now;
      if (order.status === "pending_payment") {
        data.status = "paid";
      }
    }
  }

  const updated = await prisma.uniformOrder.update({
    where: { id: orderId },
    data,
    include: {
      items: true,
      user: {
        select: {
          id: true,
          email: true,
          pilotProfile: { select: { displayName: true } },
        },
      },
    },
  });

  if (input.status === "cancelled" && order.status !== "cancelled") {
    await prisma.$transaction(async (tx) => {
      for (const item of updated.items) {
        await tx.uniformProductVariant.update({
          where: { id: item.variantId },
          data: { stockQuantity: { increment: item.quantity } },
        });
      }
    });

    notifyAsync(async () => {
      await sendNotification({
        userId: order.user.id,
        type: "welcome",
        title: "Uniform order cancelled",
        body: `Order ${order.orderNumber} was cancelled.`,
        payload: { orderId },
      });
    });
  } else if (input.status && input.status !== order.status) {
    notifyAsync(async () => {
      await sendNotification({
        userId: order.user.id,
        type: "welcome",
        title: "Uniform order update",
        body: `Order ${order.orderNumber} is now ${input.status}.`,
        payload: { orderId, status: input.status },
      });
    });
  }

  return {
    ok: true,
    order: {
      ...toOrderDto(updated),
      pilot: {
        displayName:
          updated.user.pilotProfile?.displayName ?? updated.user.email,
        email: updated.user.email,
      },
    },
  };
}

export async function seedUniformCatalog(): Promise<void> {
  const products = [
    {
      name: "Pilot Performance Polo",
      description:
        "Breathable marketplace-branded polo for client-facing operations and field work.",
      variants: [
        { sku: "POLO-S-BLK", label: "S / Black", size: "S", color: "Black", price: 42, stock: 25 },
        { sku: "POLO-M-BLK", label: "M / Black", size: "M", color: "Black", price: 42, stock: 40 },
        { sku: "POLO-L-BLK", label: "L / Black", size: "L", color: "Black", price: 42, stock: 35 },
        { sku: "POLO-XL-BLK", label: "XL / Black", size: "XL", color: "Black", price: 42, stock: 20 },
      ],
    },
    {
      name: "Flight Crew Softshell Jacket",
      description:
        "Lightweight softshell with embroidered logo — wind-resistant for outdoor missions.",
      variants: [
        { sku: "JKT-M-NVY", label: "M / Navy", size: "M", color: "Navy", price: 89, stock: 15 },
        { sku: "JKT-L-NVY", label: "L / Navy", size: "L", color: "Navy", price: 89, stock: 18 },
        { sku: "JKT-XL-NVY", label: "XL / Navy", size: "XL", color: "Navy", price: 89, stock: 12 },
      ],
    },
    {
      name: "Hi-Vis Operations Cap",
      description: "Structured cap with gold accent stitching and adjustable strap.",
      variants: [
        { sku: "CAP-OSFA", label: "One size", size: "OSFA", color: "Gold/Black", price: 24, stock: 50 },
      ],
    },
  ];

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const slug = slugify(p.name);
    const product = await prisma.uniformProduct.upsert({
      where: { slug },
      update: {
        name: p.name,
        description: p.description,
        isActive: true,
        sortOrder: i * 10,
      },
      create: {
        name: p.name,
        slug,
        description: p.description,
        isActive: true,
        sortOrder: i * 10,
      },
    });

    for (const v of p.variants) {
      await prisma.uniformProductVariant.upsert({
        where: { sku: v.sku },
        update: {
          label: v.label,
          size: v.size,
          color: v.color,
          price: v.price,
          stockQuantity: v.stock,
          isActive: true,
        },
        create: {
          productId: product.id,
          sku: v.sku,
          label: v.label,
          size: v.size,
          color: v.color,
          price: v.price,
          stockQuantity: v.stock,
          isActive: true,
        },
      });
    }
  }
}
