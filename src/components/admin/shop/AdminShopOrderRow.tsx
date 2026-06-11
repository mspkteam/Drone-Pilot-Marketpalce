"use client";

import type { AdminShopOrderCardDto } from "@/types/admin-shop";

type AdminShopOrderRowProps = {
  order: AdminShopOrderCardDto;
};

function statusClass(tone: AdminShopOrderCardDto["statusTone"]): string {
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

export function AdminShopOrderRow({ order }: AdminShopOrderRowProps) {
  return (
    <article className="admin-shop-order-row">
      <div className="admin-shop-order-copy">
        <p className="admin-shop-order-id">{order.orderNumber}</p>
        <p className="admin-shop-order-customer">{order.customerName}</p>
        <p className="admin-shop-order-meta">
          {order.itemCount} item{order.itemCount === 1 ? "" : "s"} • $
          {order.total.toLocaleString(undefined, {
            minimumFractionDigits: order.total % 1 === 0 ? 0 : 2,
            maximumFractionDigits: 2,
          })}
        </p>
      </div>
      <span className={statusClass(order.statusTone)}>{order.status}</span>
    </article>
  );
}
