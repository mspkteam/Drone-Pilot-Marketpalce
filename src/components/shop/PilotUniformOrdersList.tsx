"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { UniformOrderStatusBadge } from "@/components/shop/UniformOrderStatusBadge";
import type { UniformOrderDto } from "@/types/shop";

export function PilotUniformOrdersList() {
  const [orders, setOrders] = useState<UniformOrderDto[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/pilot/shop/orders");
      const data = await res.json();
      setOrders(res.ok ? (data.orders ?? []) : []);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="pilot-shop-orders-page">
      <header className="pilot-shop-header pilot-shop-bracket-card">
        <p className="pilot-shop-eyebrow">PILOT / UNIFORM SHOP</p>
        <h1 className="pilot-shop-title">Uniform orders</h1>
        <p className="pilot-shop-header-lead">
          Track shop orders and payment status.
        </p>
      </header>

      <section className="pilot-shop-orders-panel" aria-label="Orders">
        <h2 className="pilot-shop-orders-panel-title">MY ORDERS</h2>
        <Link href="/dashboard/pilot/shop" className="pilot-shop-orders-back">
          ← Back to shop
        </Link>

        {loading ? (
          <p className="pilot-shop-orders-loading">Loading orders…</p>
        ) : orders.length === 0 ? (
          <p className="pilot-shop-orders-empty">No orders yet.</p>
        ) : (
          <ul className="pilot-shop-orders-list">
            {orders.map((o) => (
              <li key={o.id}>
                <Link
                  href={`/dashboard/pilot/shop/orders/${o.id}`}
                  className="pilot-shop-order-row"
                >
                  <div>
                    <p className="pilot-shop-order-number">{o.orderNumber}</p>
                    <p className="pilot-shop-order-meta">
                      ${o.total.toFixed(2)} ·{" "}
                      {new Date(o.placedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <UniformOrderStatusBadge status={o.status} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
