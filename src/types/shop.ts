export const UNIFORM_ORDER_STATUSES = [
  "pending_payment",
  "paid",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
] as const;

export type UniformOrderStatus = (typeof UNIFORM_ORDER_STATUSES)[number];

export const UNIFORM_PAYMENT_STATUSES = [
  "pending",
  "paid",
  "failed",
  "refunded",
] as const;

export type UniformPaymentStatus = (typeof UNIFORM_PAYMENT_STATUSES)[number];

export type UniformProductVariantDto = {
  id: string;
  productId: string;
  sku: string;
  label: string;
  size: string | null;
  color: string | null;
  price: number;
  stockQuantity: number;
  isActive: boolean;
};

export type UniformProductDto = {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string | null;
  isActive: boolean;
  sortOrder: number;
  variants: UniformProductVariantDto[];
};

export type UniformOrderItemDto = {
  id: string;
  variantId: string;
  productName: string;
  variantLabel: string;
  sku: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
};

export type UniformOrderDto = {
  id: string;
  orderNumber: string;
  userId: string;
  status: UniformOrderStatus;
  paymentStatus: UniformPaymentStatus;
  currency: string;
  subtotal: number;
  shippingAmount: number;
  total: number;
  shippingName: string;
  shippingLine1: string;
  shippingLine2: string | null;
  shippingCity: string;
  shippingRegion: string | null;
  shippingPostal: string;
  shippingCountry: string;
  shippingPhone: string | null;
  notes: string | null;
  placedAt: string;
  paidAt: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  cancelledAt: string | null;
  items: UniformOrderItemDto[];
};

export type AdminUniformOrderDto = UniformOrderDto & {
  pilot: {
    displayName: string;
    email: string;
  };
};
