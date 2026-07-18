"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { AdminUniformOrderDto, UniformOrderStatus } from "@/types/shop";
import {
  UNIFORM_ORDER_STATUSES,
  UNIFORM_PAYMENT_STATUSES,
} from "@/types/shop";

type AdminShopOrdersPortalProps = {
  canUpdateOrders: boolean;
};

const STATUS_LABEL: Record<string, string> = {
  pending_payment: "Awaiting payment",
  paid: "Paid",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

function statusTone(
  status: UniformOrderStatus,
): "success" | "warning" | "error" | "neutral" {
  switch (status) {
    case "delivered":
      return "success";
    case "shipped":
    case "processing":
    case "paid":
    case "pending_payment":
      return "warning";
    case "cancelled":
      return "error";
    default:
      return "neutral";
  }
}

function statusClass(tone: ReturnType<typeof statusTone>): string {
  switch (tone) {
    case "success":
      return "admin-shop-order-status admin-shop-order-status--success";
    case "warning":
      return "admin-shop-order-status admin-shop-order-status--warning";
    case "error":
      return "admin-shop-order-status admin-shop-order-status--error";
    default:
      return "admin-shop-order-status";
  }
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatMoney(amount: number): string {
  return `$${amount.toLocaleString(undefined, {
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

export function AdminShopOrdersPortal({
  canUpdateOrders,
}: AdminShopOrdersPortalProps) {
  const [orders, setOrders] = useState<AdminUniformOrderDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<UniformOrderStatus | "all">("all");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [rowError, setRowError] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/shop/orders");
      const json = (await res.json()) as {
        orders?: AdminUniformOrderDto[];
        error?: string;
      };
      if (!res.ok) {
        setError(json.error ?? "Failed to load orders.");
        setOrders([]);
      } else {
        setOrders(json.orders ?? []);
      }
    } catch {
      setError("Failed to load orders.");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: orders.length };
    for (const s of UNIFORM_ORDER_STATUSES) map[s] = 0;
    for (const o of orders) map[o.status] = (map[o.status] ?? 0) + 1;
    return map;
  }, [orders]);

  const visibleOrders = useMemo(() => {
    if (filter === "all") return orders;
    return orders.filter((o) => o.status === filter);
  }, [orders, filter]);

  const patchOrder = useCallback(
    async (id: string, patch: { status?: string; paymentStatus?: string }) => {
      setSavingId(id);
      setRowError((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      try {
        const res = await fetch(`/api/admin/shop/orders/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(patch),
        });
        const json = (await res.json()) as {
          order?: AdminUniformOrderDto;
          error?: string;
        };
        if (!res.ok || !json.order) {
          setRowError((prev) => ({
            ...prev,
            [id]: json.error ?? "Update failed.",
          }));
          return;
        }
        const updated = json.order;
        setOrders((prev) => prev.map((o) => (o.id === id ? updated : o)));
      } catch {
        setRowError((prev) => ({ ...prev, [id]: "Update failed." }));
      } finally {
        setSavingId(null);
      }
    },
    [],
  );

  return (
    <div className="admin-shop-page">
      <section
        className="admin-shop-hero admin-ops-bracket-card"
        aria-label="All uniform orders"
      >
        <div className="admin-ops-hero-glow" aria-hidden />
        <div className="admin-shop-hero-inner">
          <div className="admin-shop-hero-copy">
            <p className="admin-ops-eyebrow">UNIFORM SHOP</p>
            <h1 className="admin-shop-hero-title">All Orders</h1>
            <p className="admin-shop-hero-desc">
              Full uniform order history — filter by status and manage
              fulfillment.
            </p>
          </div>
          <Link href="/dashboard/admin/shop" className="admin-shop-orders-back">
            ← Back to shop
          </Link>
        </div>
      </section>

      {error ? (
        <p className="admin-shop-banner admin-shop-banner--error" role="alert">
          {error}
        </p>
      ) : null}

      <section className="admin-shop-panel" aria-label="Orders">
        <div className="admin-shop-orders-filters" role="tablist" aria-label="Filter orders by status">
          {(["all", ...UNIFORM_ORDER_STATUSES] as const).map((key) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={filter === key}
              className={`admin-shop-orders-filter${
                filter === key ? " admin-shop-orders-filter--active" : ""
              }`}
              onClick={() => setFilter(key)}
            >
              {key === "all" ? "All" : STATUS_LABEL[key]}
              <span className="admin-shop-orders-filter-count">
                {counts[key] ?? 0}
              </span>
            </button>
          ))}
        </div>

        {loading ? (
          <p className="admin-shop-loading">Loading orders…</p>
        ) : visibleOrders.length === 0 ? (
          <p className="admin-shop-empty">
            {orders.length === 0
              ? "No uniform orders yet."
              : "No orders with this status."}
          </p>
        ) : (
          <div className="admin-shop-orders-full-list">
            {visibleOrders.map((order) => {
              const tone = statusTone(order.status);
              return (
                <article key={order.id} className="admin-shop-order-card">
                  <div className="admin-shop-order-card-head">
                    <div>
                      <p className="admin-shop-order-id">{order.orderNumber}</p>
                      <p className="admin-shop-order-customer">
                        {order.pilot.displayName}
                      </p>
                      <p className="admin-shop-order-meta">
                        {order.pilot.email} • {formatDate(order.placedAt)}
                      </p>
                    </div>
                    <span className={statusClass(tone)}>
                      {STATUS_LABEL[order.status] ?? order.status}
                    </span>
                  </div>

                  <ul className="admin-shop-order-items">
                    {order.items.map((item) => (
                      <li key={item.id} className="admin-shop-order-item">
                        <span className="admin-shop-order-item-name">
                          {item.productName}
                          {item.variantLabel ? ` — ${item.variantLabel}` : ""}
                        </span>
                        <span className="admin-shop-order-item-qty">
                          ×{item.quantity}
                        </span>
                        <span className="admin-shop-order-item-price">
                          {formatMoney(item.lineTotal)}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div className="admin-shop-order-card-foot">
                    <div className="admin-shop-order-totals">
                      <span>
                        Subtotal {formatMoney(order.subtotal)} • Shipping{" "}
                        {formatMoney(order.shippingAmount)}
                      </span>
                      <span className="admin-shop-order-total">
                        Total {formatMoney(order.total)}
                      </span>
                    </div>

                    {canUpdateOrders ? (
                      <div className="admin-shop-order-controls">
                        <label className="admin-shop-order-control">
                          <span>Status</span>
                          <select
                            value={order.status}
                            disabled={savingId === order.id}
                            onChange={(e) =>
                              void patchOrder(order.id, {
                                status: e.target.value,
                              })
                            }
                          >
                            {UNIFORM_ORDER_STATUSES.map((s) => (
                              <option key={s} value={s}>
                                {STATUS_LABEL[s]}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="admin-shop-order-control">
                          <span>Payment</span>
                          <select
                            value={order.paymentStatus}
                            disabled={savingId === order.id}
                            onChange={(e) =>
                              void patchOrder(order.id, {
                                paymentStatus: e.target.value,
                              })
                            }
                          >
                            {UNIFORM_PAYMENT_STATUSES.map((s) => (
                              <option key={s} value={s}>
                                {s.charAt(0).toUpperCase() + s.slice(1)}
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>
                    ) : (
                      <span className="admin-shop-order-payment-note">
                        Payment: {order.paymentStatus}
                      </span>
                    )}
                  </div>

                  {rowError[order.id] ? (
                    <p className="admin-shop-order-row-error" role="alert">
                      {rowError[order.id]}
                    </p>
                  ) : null}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
