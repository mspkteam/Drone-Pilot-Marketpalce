"use client";

import Image from "next/image";
import type { AdminInventoryRowDto } from "@/types/admin-shop";

type AdminShopInventoryRowProps = {
  row: AdminInventoryRowDto;
  canManage: boolean;
  onEdit?: (row: AdminInventoryRowDto) => void;
};

function statusClass(status: AdminInventoryRowDto["status"]): string {
  switch (status) {
    case "IN_STOCK":
      return "admin-shop-stock admin-shop-stock--in";
    case "LOW_STOCK":
      return "admin-shop-stock admin-shop-stock--low";
    case "OUT_OF_STOCK":
      return "admin-shop-stock admin-shop-stock--out";
  }
}

export function AdminShopInventoryRow({
  row,
  canManage,
  onEdit,
}: AdminShopInventoryRowProps) {
  const content = (
    <>
      <div className="admin-shop-inventory-icon" aria-hidden>
        <Image
          src={row.imageSrc}
          alt=""
          width={48}
          height={48}
          className="admin-shop-inventory-icon-img"
        />
      </div>
      <div className="admin-shop-inventory-copy">
        <p className="admin-shop-inventory-name">{row.name}</p>
        <p className="admin-shop-inventory-sku">{row.sku}</p>
      </div>
      <div className="admin-shop-inventory-price-block">
        <p className="admin-shop-inventory-price">${row.price.toLocaleString()}</p>
        <p className="admin-shop-inventory-stock">{row.stockLabel}</p>
      </div>
      <span className={statusClass(row.status)}>{row.status.replace("_", " ")}</span>
    </>
  );

  if (canManage && onEdit && !row.isMock) {
    return (
      <button
        type="button"
        className="admin-shop-inventory-row admin-shop-inventory-row--clickable"
        onClick={() => onEdit(row)}
      >
        {content}
      </button>
    );
  }

  return <div className="admin-shop-inventory-row">{content}</div>;
}
