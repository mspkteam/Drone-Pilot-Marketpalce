"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminShopInventoryRow } from "@/components/admin/shop/AdminShopInventoryRow";
import { AdminShopOrderRow } from "@/components/admin/shop/AdminShopOrderRow";
import { AdminShopProductModal } from "@/components/admin/shop/AdminShopProductModal";
import type {
  AdminInventoryRowDto,
  AdminShopEngineDataDto,
  ShopProductFormInput,
} from "@/types/admin-shop";

function isPositiveGrowth(subtext: string): boolean {
  return subtext.trim().startsWith("+");
}

function formatMoney(amount: number): string {
  return `$${amount.toLocaleString()}`;
}

type AdminUniformShopPortalProps = {
  canManageProducts: boolean;
};

export function AdminUniformShopPortal({
  canManageProducts,
}: AdminUniformShopPortalProps) {
  const [data, setData] = useState<AdminShopEngineDataDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [inventorySearch, setInventorySearch] = useState("");
  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [editingProduct, setEditingProduct] = useState<AdminInventoryRowDto | null>(
    null,
  );
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/shop-engine");
      const json = (await res.json()) as AdminShopEngineDataDto & { error?: string };
      if (!res.ok) {
        setError(json.error ?? "Failed to load shop data.");
        setData(null);
      } else {
        setData(json);
      }
    } catch {
      setError("Failed to load shop data.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filteredInventory = useMemo(() => {
    const query = inventorySearch.trim().toLowerCase();
    const rows = data?.inventory ?? [];
    if (!query) return rows;
    return rows.filter(
      (row) =>
        row.name.toLowerCase().includes(query) ||
        row.sku.toLowerCase().includes(query) ||
        row.category.toLowerCase().includes(query),
    );
  }, [data?.inventory, inventorySearch]);

  async function handleSaveProduct(input: ShopProductFormInput) {
    if (!canManageProducts) return;
    if (modalMode === "edit" && editingProduct?.isMock) {
      setModalError(
        "Sample products are preview-only until real catalog items exist in the database.",
      );
      return;
    }

    setSaving(true);
    setModalError(null);
    try {
      if (modalMode === "create") {
        const productRes = await fetch("/api/admin/shop/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: input.name,
            description: input.description,
            imageUrl: input.imageUrl || null,
          }),
        });
        const productJson = await productRes.json();
        if (!productRes.ok) {
          setModalError(productJson.error ?? "Product create failed.");
          return;
        }

        const variantRes = await fetch(
          `/api/admin/shop/products/${productJson.product.id}/variants`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sku: input.sku,
              label: input.name,
              price: input.price,
              stockQuantity: input.stockQuantity,
            }),
          },
        );
        const variantJson = await variantRes.json();
        if (!variantRes.ok) {
          setModalError(
            variantJson.error ??
              "Product created but variant failed — add variant from catalog tools.",
          );
          await load();
          return;
        }

        setSuccess(`Product "${input.name}" created.`);
        setModalMode(null);
        await load();
      } else if (modalMode === "edit" && editingProduct) {
        const productRes = await fetch(
          `/api/admin/shop/products/${editingProduct.productId}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: input.name,
              description: input.description,
              imageUrl: input.imageUrl || null,
              isActive: input.isActive,
            }),
          },
        );
        const productJson = await productRes.json();
        if (!productRes.ok) {
          setModalError(productJson.error ?? "Product update failed.");
          return;
        }

        if (editingProduct.variantId) {
          const variantRes = await fetch(
            `/api/admin/shop/variants/${editingProduct.variantId}`,
            {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                label: input.name,
                price: input.price,
                stockQuantity: input.stockQuantity,
              }),
            },
          );
          const variantJson = await variantRes.json();
          if (!variantRes.ok) {
            setModalError(variantJson.error ?? "Variant update failed.");
            return;
          }
        }

        setSuccess(`Product "${input.name}" updated.`);
        setModalMode(null);
        setEditingProduct(null);
        await load();
      }
    } catch {
      setModalError("Save failed.");
    } finally {
      setSaving(false);
    }
  }

  const stats = data?.stats;
  const recentOrders = data?.recentOrders ?? [];
  const fulfillmentPercent = data?.fulfillmentPercent ?? 82;

  if (loading) {
    return <p className="admin-shop-loading">Loading products & orders…</p>;
  }

  return (
    <div className="admin-shop-page">
      <section
        className="admin-shop-hero admin-ops-bracket-card"
        aria-label="Uniform shop products and orders"
      >
        <div className="admin-ops-hero-glow" aria-hidden />
        <div className="admin-shop-hero-inner">
          <div className="admin-shop-hero-copy">
            <p className="admin-ops-eyebrow">UNIFORM SHOP</p>
            <h1 className="admin-shop-hero-title">Products & Orders</h1>
            <p className="admin-shop-hero-desc">
              Official uniform store: products, inventory and fulfillment in one place.
            </p>
          </div>
          {canManageProducts ? (
            <button
              type="button"
              className="admin-shop-btn-gold"
              onClick={() => {
                setModalError(null);
                setEditingProduct(null);
                setModalMode("create");
              }}
            >
              ADD PRODUCT
            </button>
          ) : null}
        </div>
      </section>

      {error ? (
        <p className="admin-shop-banner admin-shop-banner--error" role="alert">
          {error}
        </p>
      ) : null}

      {success ? (
        <p className="admin-shop-banner admin-shop-banner--success" role="status">
          {success}
        </p>
      ) : null}

      {data?.usingMockInventory ? (
        <p className="admin-shop-banner admin-shop-banner--info" role="status">
          Showing sample inventory until products exist in the database. Add a product to
          seed the pilot shop catalog.
        </p>
      ) : null}

      {data?.usingMockOrders ? (
        <p className="admin-shop-banner admin-shop-banner--info" role="status">
          Showing sample recent orders until pilot uniform orders exist.
        </p>
      ) : null}

      {stats ? (
        <section className="admin-shop-stats-grid" aria-label="Shop metrics">
          <article className="admin-shop-stat-card">
            <p className="admin-shop-stat-label">REVENUE (30D)</p>
            <p className="admin-shop-stat-value">{formatMoney(stats.revenue30d)}</p>
            <p
              className={`admin-shop-stat-sub${
                isPositiveGrowth(stats.revenue30dSubtext)
                  ? " admin-shop-stat-sub--success"
                  : ""
              }`}
            >
              {stats.revenue30dSubtext}
            </p>
          </article>
          <article className="admin-shop-stat-card">
            <p className="admin-shop-stat-label">ORDERS (30D)</p>
            <p className="admin-shop-stat-value">{stats.orders30d.toLocaleString()}</p>
          </article>
          <article className="admin-shop-stat-card">
            <p className="admin-shop-stat-label">LOW STOCK SKUS</p>
            <p className="admin-shop-stat-value">{stats.lowStockSkus}</p>
            <p className="admin-shop-stat-sub">{stats.lowStockSubtext}</p>
          </article>
          <article className="admin-shop-stat-card">
            <p className="admin-shop-stat-label">AVG. ORDER VALUE</p>
            <p className="admin-shop-stat-value">{formatMoney(stats.avgOrderValue)}</p>
          </article>
        </section>
      ) : null}

      <div className="admin-shop-main">
        <section className="admin-shop-panel" aria-label="Inventory">
          <div className="admin-shop-panel-head">
            <h2 className="admin-shop-panel-title">INVENTORY</h2>
            <input
              type="search"
              className="admin-shop-panel-search"
              placeholder="Filter…"
              value={inventorySearch}
              onChange={(event) => setInventorySearch(event.target.value)}
              aria-label="Filter inventory"
            />
          </div>
          <div className="admin-shop-inventory-list">
            {filteredInventory.length === 0 ? (
              <p className="admin-shop-empty">No products match your filter.</p>
            ) : (
              filteredInventory.map((row) => (
                <AdminShopInventoryRow
                  key={row.productId}
                  row={row}
                  canManage={canManageProducts}
                  onEdit={(item) => {
                    setModalError(null);
                    setEditingProduct(item);
                    setModalMode("edit");
                  }}
                />
              ))
            )}
          </div>
        </section>

        <section className="admin-shop-panel" aria-label="Recent orders">
          <div className="admin-shop-panel-head">
            <h2 className="admin-shop-panel-title">RECENT ORDERS</h2>
            <button
              type="button"
              className="admin-shop-view-all"
              title="Full orders list route pending — recent orders shown here"
            >
              VIEW ALL
            </button>
          </div>

          <div className="admin-shop-orders-list">
            {recentOrders.map((order) => (
              <AdminShopOrderRow key={order.id} order={order} />
            ))}
          </div>

          <div className="admin-shop-fulfillment">
            <div className="admin-shop-fulfillment-head">
              <p className="admin-shop-fulfillment-label">TOTAL QUEUE STATUS</p>
              <div className="admin-shop-fulfillment-values">
                <span className="admin-shop-fulfillment-pct">{fulfillmentPercent}%</span>
                <span className="admin-shop-fulfillment-caption">FULFILLED</span>
              </div>
            </div>
            <div className="admin-shop-progress-track" aria-hidden>
              <div
                className="admin-shop-progress-fill"
                style={{ width: `${fulfillmentPercent}%` }}
              />
            </div>
          </div>
        </section>
      </div>

      {modalMode ? (
        <AdminShopProductModal
          mode={modalMode}
          product={editingProduct}
          saving={saving}
          error={modalError}
          onClose={() => {
            setModalMode(null);
            setEditingProduct(null);
            setModalError(null);
          }}
          onSave={handleSaveProduct}
        />
      ) : null}
    </div>
  );
}
