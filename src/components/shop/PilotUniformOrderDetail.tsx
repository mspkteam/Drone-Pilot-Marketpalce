"use client";

import Link from "next/link";
import { useState } from "react";
import { UniformOrderStatusBadge } from "@/components/shop/UniformOrderStatusBadge";
import { Button } from "@/components/ui/Button";
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
    <div className="max-w-2xl space-y-6">
      <Link
        href="/dashboard/pilot/shop/orders"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← My orders
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">{order.orderNumber}</h2>
        <UniformOrderStatusBadge status={order.status} />
      </div>

      <p className="text-sm text-muted-foreground">
        Payment: {getUniformPaymentStatusLabel(order.paymentStatus)} · Placed{" "}
        {new Date(order.placedAt).toLocaleString()}
      </p>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      {order.status === "pending_payment" &&
      order.paymentStatus === "pending" ? (
        <div className="rounded-lg border border-gold/30 bg-gold/5 p-4">
          <p className="text-sm">
            Complete payment (${order.total.toFixed(2)}) using the internal
            shop checkout — Stripe integration is deferred.
          </p>
          <Button
            type="button"
            className="mt-3"
            disabled={paying}
            onClick={() => void payNow()}
          >
            {paying ? "Processing…" : "Pay now (demo)"}
          </Button>
        </div>
      ) : null}

      <section className="rounded-lg border border-border p-4">
        <h3 className="font-medium text-sm">Items</h3>
        <ul className="mt-3 space-y-2 text-sm">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between gap-2">
              <span>
                {item.productName} ({item.variantLabel}) × {item.quantity}
              </span>
              <span>${item.lineTotal.toFixed(2)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-4 space-y-1 border-t border-border pt-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Subtotal</dt>
            <dd>${order.subtotal.toFixed(2)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Shipping</dt>
            <dd>${order.shippingAmount.toFixed(2)}</dd>
          </div>
          <div className="flex justify-between font-medium">
            <dt>Total</dt>
            <dd>${order.total.toFixed(2)}</dd>
          </div>
        </dl>
      </section>

      <section className="rounded-lg border border-border p-4 text-sm">
        <h3 className="font-medium">Ship to</h3>
        <p className="mt-2 whitespace-pre-line">
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
    </div>
  );
}
