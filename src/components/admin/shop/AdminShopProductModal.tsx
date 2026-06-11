"use client";

import { useEffect, useState } from "react";
import type { AdminInventoryRowDto, ShopProductFormInput } from "@/types/admin-shop";

const CATEGORIES = [
  "UNIFORM",
  "HEADWEAR",
  "INSIGNIA",
  "PATCHES",
  "ID",
  "DIGITAL",
];

type AdminShopProductModalProps = {
  mode: "create" | "edit";
  product: AdminInventoryRowDto | null;
  saving: boolean;
  error: string | null;
  onClose: () => void;
  onSave: (input: ShopProductFormInput) => void;
};

export function AdminShopProductModal({
  mode,
  product,
  saving,
  error,
  onClose,
  onSave,
}: AdminShopProductModalProps) {
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [category, setCategory] = useState("UNIFORM");
  const [price, setPrice] = useState("");
  const [stockQuantity, setStockQuantity] = useState("0");
  const [stockThreshold, setStockThreshold] = useState("10");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isDigital, setIsDigital] = useState(false);

  useEffect(() => {
    if (mode === "edit" && product) {
      setName(product.name);
      setSku(product.sku);
      setCategory(product.category);
      setPrice(String(product.price));
      setStockQuantity(String(product.stockQuantity));
      setDescription(product.description);
      setImageUrl(product.imageSrc.startsWith("/") ? "" : product.imageSrc);
      setIsActive(product.isActive);
      setIsDigital(product.category === "DIGITAL");
    } else {
      setName("");
      setSku("");
      setCategory("UNIFORM");
      setPrice("");
      setStockQuantity("10");
      setStockThreshold("10");
      setDescription("");
      setImageUrl("");
      setIsActive(true);
      setIsDigital(false);
    }
  }, [mode, product]);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const parsedPrice = parseFloat(price);
    const parsedStock = parseInt(stockQuantity, 10);
    const parsedThreshold = parseInt(stockThreshold, 10);
    onSave({
      name: name.trim(),
      sku: sku.trim().toUpperCase(),
      category: isDigital ? "DIGITAL" : category,
      price: parsedPrice,
      stockQuantity: Number.isFinite(parsedStock) ? parsedStock : 0,
      stockThreshold: Number.isFinite(parsedThreshold) ? parsedThreshold : 10,
      description: description.trim(),
      imageUrl: imageUrl.trim(),
      isActive,
      isDigital,
    });
  }

  return (
    <div
      className="admin-shop-modal-backdrop"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="admin-shop-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-shop-product-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="admin-shop-modal-head">
          <h2 id="admin-shop-product-title" className="admin-shop-modal-title">
            {mode === "create" ? "Add Product" : "Edit Product"}
          </h2>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="admin-shop-modal-body">
            {error ? (
              <p className="admin-shop-banner admin-shop-banner--error" role="alert">
                {error}
              </p>
            ) : null}

            <div className="admin-shop-field">
              <label htmlFor="shop-product-name">Product name</label>
              <input
                id="shop-product-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </div>

            <div className="admin-shop-field-row">
              <div className="admin-shop-field">
                <label htmlFor="shop-product-sku">SKU</label>
                <input
                  id="shop-product-sku"
                  value={sku}
                  onChange={(event) => setSku(event.target.value)}
                  required
                  disabled={mode === "edit"}
                />
              </div>
              <div className="admin-shop-field">
                <label htmlFor="shop-product-category">Category</label>
                <select
                  id="shop-product-category"
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  disabled={isDigital}
                >
                  {CATEGORIES.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="admin-shop-field-row">
              <div className="admin-shop-field">
                <label htmlFor="shop-product-price">Price</label>
                <input
                  id="shop-product-price"
                  type="number"
                  min={0}
                  step="0.01"
                  value={price}
                  onChange={(event) => setPrice(event.target.value)}
                  required
                />
              </div>
              <div className="admin-shop-field">
                <label htmlFor="shop-product-stock">Inventory quantity</label>
                <input
                  id="shop-product-stock"
                  type="number"
                  min={0}
                  value={stockQuantity}
                  onChange={(event) => setStockQuantity(event.target.value)}
                  required
                />
              </div>
            </div>

            <div className="admin-shop-field">
              <label htmlFor="shop-product-threshold">Stock threshold (display)</label>
              <input
                id="shop-product-threshold"
                type="number"
                min={1}
                value={stockThreshold}
                onChange={(event) => setStockThreshold(event.target.value)}
              />
            </div>

            <div className="admin-shop-field">
              <label htmlFor="shop-product-desc">Description</label>
              <textarea
                id="shop-product-desc"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={3}
                required
                minLength={10}
              />
            </div>

            <div className="admin-shop-field">
              <label htmlFor="shop-product-image">Product image URL</label>
              <input
                id="shop-product-image"
                value={imageUrl}
                onChange={(event) => setImageUrl(event.target.value)}
                placeholder="https://… or leave blank for default"
              />
            </div>

            <div className="admin-shop-checks">
              <label className="admin-shop-check">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(event) => setIsActive(event.target.checked)}
                />
                Active / visible in pilot shop
              </label>
              <label className="admin-shop-check">
                <input
                  type="checkbox"
                  checked={isDigital}
                  onChange={(event) => setIsDigital(event.target.checked)}
                />
                Digital product
              </label>
            </div>

            <p className="admin-shop-hint">
              Stock threshold is display-only until per-SKU alert rules are persisted.
              New products create a primary variant with the SKU, price, and stock entered
              above.
            </p>
          </div>

          <div className="admin-shop-modal-foot">
            <button
              type="button"
              className="admin-shop-btn-cancel"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>
            <button type="submit" className="admin-shop-btn-save" disabled={saving}>
              {saving ? "Saving…" : "Save Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
