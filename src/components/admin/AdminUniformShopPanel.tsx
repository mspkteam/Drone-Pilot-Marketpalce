"use client";

import { useCallback, useEffect, useState } from "react";
import { UniformOrderStatusBadge } from "@/components/shop/UniformOrderStatusBadge";
import { Button } from "@/components/ui/Button";
import { FormField, inputClassName } from "@/components/ui/FormField";
import {
  getUniformOrderStatusLabel,
  getUniformPaymentStatusLabel,
} from "@/lib/shop/status";
import type { AdminUniformOrderDto, UniformProductDto } from "@/types/shop";
import type { UniformOrderStatus } from "@/types/shop";
import { UNIFORM_ORDER_STATUSES, UNIFORM_PAYMENT_STATUSES } from "@/types/shop";
import { cn } from "@/lib/utils";

type AdminUniformShopPanelProps = {
  isSuperAdmin: boolean;
};

export function AdminUniformShopPanel({
  isSuperAdmin,
}: AdminUniformShopPanelProps) {
  const [tab, setTab] = useState<"orders" | "catalog">("orders");
  const [orders, setOrders] = useState<AdminUniformOrderDto[]>([]);
  const [products, setProducts] = useState<UniformProductDto[]>([]);
  const [orderFilter, setOrderFilter] = useState<UniformOrderStatus | "all">(
    "all",
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [productName, setProductName] = useState("");
  const [productDesc, setProductDesc] = useState("");
  const [variantProductId, setVariantProductId] = useState("");
  const [variantSku, setVariantSku] = useState("");
  const [variantLabel, setVariantLabel] = useState("");
  const [variantPrice, setVariantPrice] = useState("");
  const [variantStock, setVariantStock] = useState("10");

  const loadOrders = useCallback(async () => {
    const res = await fetch(`/api/admin/shop/orders?status=${orderFilter}`);
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Failed to load orders.");
      setOrders([]);
    } else {
      setOrders(data.orders ?? []);
    }
  }, [orderFilter]);

  const loadProducts = useCallback(async () => {
    if (!isSuperAdmin) return;
    const res = await fetch("/api/admin/shop/products");
    const data = await res.json();
    if (res.ok) {
      setProducts(data.products ?? []);
    }
  }, [isSuperAdmin]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    await loadOrders();
    await loadProducts();
    setLoading(false);
  }, [loadOrders, loadProducts]);

  useEffect(() => {
    void load();
  }, [load]);

  async function updateOrder(
    orderId: string,
    patch: { status?: string; paymentStatus?: string },
  ) {
    setError(null);
    const res = await fetch(`/api/admin/shop/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Update failed.");
    } else {
      await loadOrders();
    }
  }

  async function createProduct(e: React.FormEvent) {
    e.preventDefault();
    if (!isSuperAdmin) return;
    const res = await fetch("/api/admin/shop/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: productName, description: productDesc }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Create failed.");
    } else {
      setProductName("");
      setProductDesc("");
      await loadProducts();
    }
  }

  async function addVariant(e: React.FormEvent) {
    e.preventDefault();
    if (!isSuperAdmin || !variantProductId) return;
    const res = await fetch(
      `/api/admin/shop/products/${variantProductId}/variants`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sku: variantSku,
          label: variantLabel,
          price: parseFloat(variantPrice),
          stockQuantity: parseInt(variantStock, 10),
        }),
      },
    );
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Variant create failed.");
    } else {
      setVariantSku("");
      setVariantLabel("");
      await loadProducts();
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setTab("orders")}
          className={cn(
            "rounded-full border px-3 py-1 text-sm",
            tab === "orders"
              ? "border-gold bg-gold/10 text-gold-dark"
              : "border-border",
          )}
        >
          Orders
        </button>
        {isSuperAdmin ? (
          <button
            type="button"
            onClick={() => setTab("catalog")}
            className={cn(
              "rounded-full border px-3 py-1 text-sm",
              tab === "catalog"
                ? "border-gold bg-gold/10 text-gold-dark"
                : "border-border",
            )}
          >
            Catalog
          </button>
        ) : null}
      </div>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : tab === "orders" ? (
        <>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setOrderFilter("all")}
              className="text-sm underline-offset-2 hover:underline"
            >
              All
            </button>
            {UNIFORM_ORDER_STATUSES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setOrderFilter(s)}
                className={cn(
                  "text-sm",
                  orderFilter === s ? "font-medium text-gold-dark" : "text-muted-foreground",
                )}
              >
                {getUniformOrderStatusLabel(s)}
              </button>
            ))}
          </div>
          {orders.length === 0 ? (
            <p className="text-sm text-muted-foreground">No orders.</p>
          ) : (
            <ul className="divide-y divide-border rounded-lg border border-border">
              {orders.map((o) => (
                <li key={o.id} className="space-y-3 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-medium">{o.orderNumber}</p>
                      <p className="text-sm text-muted-foreground">
                        {o.pilot.displayName} · {o.pilot.email}
                      </p>
                      <p className="text-sm">
                        ${o.total.toFixed(2)} ·{" "}
                        {getUniformPaymentStatusLabel(o.paymentStatus)}
                      </p>
                    </div>
                    <UniformOrderStatusBadge status={o.status} />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <select
                      className={inputClassName}
                      value={o.status}
                      onChange={(e) =>
                        void updateOrder(o.id, { status: e.target.value })
                      }
                    >
                      {UNIFORM_ORDER_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {getUniformOrderStatusLabel(s)}
                        </option>
                      ))}
                    </select>
                    <select
                      className={inputClassName}
                      value={o.paymentStatus}
                      onChange={(e) =>
                        void updateOrder(o.id, {
                          paymentStatus: e.target.value,
                        })
                      }
                    >
                      {UNIFORM_PAYMENT_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {getUniformPaymentStatusLabel(s)}
                        </option>
                      ))}
                    </select>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      ) : (
        <div className="space-y-8 max-w-2xl">
          <form onSubmit={(e) => void createProduct(e)} className="space-y-3 rounded-lg border border-border p-4">
            <h2 className="font-semibold">New product</h2>
            <FormField label="Name" htmlFor="prod-name">
              <input
                id="prod-name"
                className={inputClassName}
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                required
              />
            </FormField>
            <FormField label="Description" htmlFor="prod-desc">
              <textarea
                id="prod-desc"
                className={inputClassName}
                rows={3}
                value={productDesc}
                onChange={(e) => setProductDesc(e.target.value)}
                required
              />
            </FormField>
            <Button type="submit">Create product</Button>
          </form>

          <form onSubmit={(e) => void addVariant(e)} className="space-y-3 rounded-lg border border-border p-4">
            <h2 className="font-semibold">Add variant</h2>
            <FormField label="Product" htmlFor="var-prod">
              <select
                id="var-prod"
                className={inputClassName}
                value={variantProductId}
                onChange={(e) => setVariantProductId(e.target.value)}
                required
              >
                <option value="">Select…</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="SKU" htmlFor="var-sku">
              <input
                id="var-sku"
                className={inputClassName}
                value={variantSku}
                onChange={(e) => setVariantSku(e.target.value)}
                required
              />
            </FormField>
            <FormField label="Label" htmlFor="var-label">
              <input
                id="var-label"
                className={inputClassName}
                value={variantLabel}
                onChange={(e) => setVariantLabel(e.target.value)}
                required
              />
            </FormField>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Price" htmlFor="var-price">
                <input
                  id="var-price"
                  type="number"
                  step="0.01"
                  className={inputClassName}
                  value={variantPrice}
                  onChange={(e) => setVariantPrice(e.target.value)}
                  required
                />
              </FormField>
              <FormField label="Stock" htmlFor="var-stock">
                <input
                  id="var-stock"
                  type="number"
                  className={inputClassName}
                  value={variantStock}
                  onChange={(e) => setVariantStock(e.target.value)}
                  required
                />
              </FormField>
            </div>
            <Button type="submit">Add variant</Button>
          </form>

          <section>
            <h2 className="font-semibold">Catalog</h2>
            <ul className="mt-4 space-y-4">
              {products.map((p) => (
                <li key={p.id} className="rounded-lg border border-border p-4">
                  <p className="font-medium">
                    {p.name} {p.isActive ? "" : "(inactive)"}
                  </p>
                  <ul className="mt-2 text-sm text-muted-foreground space-y-1">
                    {p.variants.map((v) => (
                      <li key={v.id}>
                        {v.sku} · {v.label} · ${v.price} · stock {v.stockQuantity}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}
    </div>
  );
}
