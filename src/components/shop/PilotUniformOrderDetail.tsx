"use client";

import Link from "next/link";
import { useState } from "react";
import { UniformOrderStatusBadge } from "@/components/shop/UniformOrderStatusBadge";
import { getUniformPaymentStatusLabel } from "@/lib/shop/status";
import type { UniformOrderDto } from "@/types/shop";

export function PilotUniformOrderDetail({
  initialOrder,
}: {
  initialOrder: UniformOrderDto;
}) {
  const [order, setOrder] = useState(initialOrder);
  const [error, setError] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);

  async function payNow() {
    setPaying(true);
    setError(null);
    try {
      const res = await fetch(`/api/pilot/shop/orders/${order.id}/pay`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Payment failed.");
      } else {
        setOrder(data.order);
      }
    } catch {
      setError("Payment failed.");
    } finally {
      setPaying(false);
    }
  }

  return (
    <div className="pilot-shop-orders-page">
      <header className="pilot-shop-header pilot-shop-bracket-card">
        <p className="pilot-shop-eyebrow">PILOT / UNIFORM SHOP</p>
        <h1 className="pilot-shop-title">Order</h1>
        <p className="pilot-shop-header-lead">{order.orderNumber}</p>
      </header>

      <section className="pilot-shop-order-detail-panel" aria-label="Order detail">
        <Link href="/dashboard/pilot/shop/orders" className="pilot-shop-orders-back">
          ← My orders
        </Link>

        <div className="pilot-shop-order-detail-top">
          <h2 className="pilot-shop-order-detail-title">{order.orderNumber}</h2>
          <UniformOrderStatusBadge status={order.status} />
        </div>

        <p className="pilot-shop-order-detail-meta">
          Payment: {getUniformPaymentStatusLabel(order.paymentStatus)} · Placed{" "}
          {new Date(order.placedAt).toLocaleString()}
        </p>

        {error ? (
          <p className="pilot-shop-banner" role="alert">
            {error}
          </p>
        ) : null}

        {order.status === "pending_payment" &&
        order.paymentStatus === "pending" ? (
          <div className="pilot-shop-order-pay-box">
            <p>
              Complete payment (${order.total.toFixed(2)}) using the internal shop
              checkout — Stripe integration is deferred.
            </p>
            <button
              type="button"
              className="pilot-shop-order-pay-btn"
              disabled={paying}
              onClick={() => void payNow()}
            >
              {paying ? "Processing…" : "Pay now (demo)"}
            </button>
          </div>
        ) : null}

        <section className="pilot-shop-order-section">
          <h3 className="pilot-shop-order-section-title">Items</h3>
          <ul className="pilot-shop-order-items">
            {order.items.map((item) => (
              <li key={item.id} className="pilot-shop-order-item">
                <span>
                  {item.productName} ({item.variantLabel}) × {item.quantity}
                </span>
                <span>${item.lineTotal.toFixed(2)}</span>
              </li>
            ))}
          </ul>
          <dl className="pilot-shop-order-totals">
            <div className="pilot-shop-order-totals-row">
              <dt>Subtotal</dt>
              <dd>${order.subtotal.toFixed(2)}</dd>
            </div>
            <div className="pilot-shop-order-totals-row">
              <dt>Shipping</dt>
              <dd>${order.shippingAmount.toFixed(2)}</dd>
            </div>
            <div className="pilot-shop-order-totals-row pilot-shop-order-totals-row--total">
              <dt>Total</dt>
              <dd>${order.total.toFixed(2)}</dd>
            </div>
          </dl>
        </section>

        <section className="pilot-shop-order-section">
          <h3 className="pilot-shop-order-section-title">Ship to</h3>
          <p className="pilot-shop-order-ship-copy">
            {order.shippingName}
            {"\n"}
            {order.shippingLine1}
            {order.shippingLine2 ? `\n${order.shippingLine2}` : ""}
            {"\n"}
            {order.shippingCity}
            {order.shippingRegion ? `, ${order.shippingRegion}` : ""}{" "}
            {order.shippingPostal}
            {"\n"}
            {order.shippingCountry}
          </p>
        </section>
      </section>
    </div>
  );
}
