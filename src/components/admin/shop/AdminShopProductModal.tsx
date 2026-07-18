"use client";

import { useEffect, useId, useState } from "react";
import { DashboardModalPortal } from "@/components/ui/DashboardModalPortal";
import type { AdminInventoryRowDto, ShopProductFormInput } from "@/types/admin-shop";

const CATEGORIES = [
  "UNIFORM",
  "HEADWEAR",
  "INSIGNIA",
  "PATCHES",
  "ID",
  "DIGITAL",
] as const;

type ProductDataTab = "general" | "inventory" | "advanced";

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
  const titleId = useId();
  const [dataTab, setDataTab] = useState<ProductDataTab>("general");
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [category, setCategory] = useState<string>("UNIFORM");
  const [price, setPrice] = useState("");
  const [stockQuantity, setStockQuantity] = useState("0");
  const [stockThreshold, setStockThreshold] = useState("10");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isDigital, setIsDigital] = useState(false);

  useEffect(() => {
    setDataTab("general");
    if (mode === "edit" && product) {
      setName(product.name);
      setSku(product.sku);
      setCategory(product.category);
      setPrice(String(product.price));
      setStockQuantity(String(product.stockQuantity));
      setStockThreshold("10");
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

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !saving) onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, saving]);

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

  const variantCount = mode === "edit" && product ? product.variantCount : 1;
  const isMultiVariant = variantCount > 1;

  const imagePreview =
    imageUrl.trim() ||
    (mode === "edit" && product?.imageSrc.startsWith("/")
      ? product.imageSrc
      : "");

  return (
    <DashboardModalPortal>
      <div
        className="admin-shop-modal-backdrop"
        role="presentation"
        onClick={() => {
          if (!saving) onClose();
        }}
      >
        <div
          className="admin-shop-modal admin-shop-modal--wc"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="admin-shop-modal-head admin-shop-modal-head--wc">
            <div>
              <p className="admin-shop-modal-kicker">UNIFORM SHOP</p>
              <h2 id={titleId} className="admin-shop-modal-title">
                {mode === "create" ? "Add new product" : "Edit product"}
              </h2>
            </div>
            <button
              type="button"
              className="admin-shop-modal-close"
              onClick={onClose}
              disabled={saving}
              aria-label="Close"
            >
              ×
            </button>
          </div>

          <form className="admin-shop-modal-form--wc" onSubmit={handleSubmit}>
            <div className="admin-shop-modal-scroll">
              {error ? (
                <p
                  className="admin-shop-banner admin-shop-banner--error"
                  role="alert"
                >
                  {error}
                </p>
              ) : null}

              <div className="admin-shop-wc-title-block">
                <input
                  id="shop-product-name"
                  className="admin-shop-wc-title-input"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Product name"
                  aria-label="Product name"
                  required
                />
              </div>

              <div className="admin-shop-wc-layout">
                <div className="admin-shop-wc-main">
                  <section className="admin-shop-wc-panel">
                    <header className="admin-shop-wc-panel-head">
                      <h3>Product description</h3>
                    </header>
                    <div className="admin-shop-wc-panel-body">
                      <textarea
                        id="shop-product-desc"
                        className="admin-shop-wc-desc"
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                        rows={6}
                        required
                        minLength={10}
                        placeholder="Describe the uniform item for pilots…"
                      />
                    </div>
                  </section>

                  <section className="admin-shop-wc-panel admin-shop-wc-panel--data">
                    <header className="admin-shop-wc-panel-head">
                      <h3>Product data</h3>
                      <span className="admin-shop-wc-product-type">
                        {isDigital ? "Digital / virtual" : "Simple product"}
                      </span>
                    </header>
                    <div className="admin-shop-wc-data">
                      <nav
                        className="admin-shop-wc-tabs"
                        aria-label="Product data sections"
                      >
                        {(
                          [
                            ["general", "General"],
                            ["inventory", "Inventory"],
                            ["advanced", "Advanced"],
                          ] as const
                        ).map(([id, label]) => (
                          <button
                            key={id}
                            type="button"
                            className={`admin-shop-wc-tab${
                              dataTab === id ? " is-active" : ""
                            }`}
                            onClick={() => setDataTab(id)}
                            aria-selected={dataTab === id}
                          >
                            {label}
                          </button>
                        ))}
                      </nav>

                      <div className="admin-shop-wc-tab-panel">
                        {dataTab === "general" ? (
                          <div className="admin-shop-wc-fields">
                            <div className="admin-shop-field admin-shop-field--inline">
                              <label htmlFor="shop-product-price">
                                Regular price (USD)
                              </label>
                              <input
                                id="shop-product-price"
                                type="number"
                                min={0}
                                step="0.01"
                                value={price}
                                onChange={(event) =>
                                  setPrice(event.target.value)
                                }
                                required
                              />
                            </div>
                            <p className="admin-shop-hint">
                              {isMultiVariant
                                ? `Applies to all ${variantCount} size/colour variants of this product.`
                                : "Sets the price for this product."}
                            </p>
                          </div>
                        ) : null}

                        {dataTab === "inventory" ? (
                          <div className="admin-shop-wc-fields">
                            <div className="admin-shop-field admin-shop-field--inline">
                              <label htmlFor="shop-product-sku">SKU</label>
                              <input
                                id="shop-product-sku"
                                value={sku}
                                onChange={(event) => setSku(event.target.value)}
                                required
                                disabled={mode === "edit"}
                              />
                            </div>
                            <div className="admin-shop-field admin-shop-field--inline">
                              <label htmlFor="shop-product-stock">
                                {isMultiVariant
                                  ? "Stock quantity (total)"
                                  : "Stock quantity"}
                              </label>
                              <input
                                id="shop-product-stock"
                                type="number"
                                min={0}
                                value={stockQuantity}
                                onChange={(event) =>
                                  setStockQuantity(event.target.value)
                                }
                                required={!isMultiVariant}
                                disabled={isMultiVariant}
                              />
                            </div>
                            <div className="admin-shop-field admin-shop-field--inline">
                              <label htmlFor="shop-product-threshold">
                                Low stock threshold
                              </label>
                              <input
                                id="shop-product-threshold"
                                type="number"
                                min={1}
                                value={stockThreshold}
                                onChange={(event) =>
                                  setStockThreshold(event.target.value)
                                }
                              />
                            </div>
                            <p className="admin-shop-hint">
                              {isMultiVariant
                                ? "This product has multiple variants — per-variant stock is managed in catalog tools. Threshold is used for low-stock display."
                                : "Threshold is used for admin low-stock display. SKU cannot change after create."}
                            </p>
                          </div>
                        ) : null}

                        {dataTab === "advanced" ? (
                          <div className="admin-shop-wc-fields">
                            <label className="admin-shop-check">
                              <input
                                type="checkbox"
                                checked={isDigital}
                                onChange={(event) => {
                                  const next = event.target.checked;
                                  setIsDigital(next);
                                  if (next) setCategory("DIGITAL");
                                }}
                              />
                              Virtual / digital product (no shipping)
                            </label>
                            <p className="admin-shop-hint">
                              Digital products are listed under the DIGITAL
                              category in the pilot shop.
                            </p>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </section>
                </div>

                <aside className="admin-shop-wc-side">
                  <section className="admin-shop-wc-panel">
                    <header className="admin-shop-wc-panel-head">
                      <h3>Publish</h3>
                    </header>
                    <div className="admin-shop-wc-panel-body admin-shop-wc-publish">
                      <div className="admin-shop-wc-publish-row">
                        <span>Status</span>
                        <strong>{isActive ? "Published" : "Draft"}</strong>
                      </div>
                      <div className="admin-shop-wc-publish-row">
                        <span>Visibility</span>
                        <strong>
                          {isActive ? "Shop catalog" : "Hidden"}
                        </strong>
                      </div>
                      <label className="admin-shop-check">
                        <input
                          type="checkbox"
                          checked={isActive}
                          onChange={(event) =>
                            setIsActive(event.target.checked)
                          }
                        />
                        Active / visible in pilot shop
                      </label>
                      <div className="admin-shop-wc-publish-actions">
                        <button
                          type="button"
                          className="admin-shop-btn-cancel"
                          onClick={onClose}
                          disabled={saving}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="admin-shop-btn-save"
                          disabled={saving}
                        >
                          {saving
                            ? "Saving…"
                            : mode === "create"
                              ? "Publish"
                              : "Update"}
                        </button>
                      </div>
                    </div>
                  </section>

                  <section className="admin-shop-wc-panel">
                    <header className="admin-shop-wc-panel-head">
                      <h3>Product image</h3>
                    </header>
                    <div className="admin-shop-wc-panel-body">
                      <div className="admin-shop-wc-image-preview">
                        {imagePreview ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={imagePreview} alt="" />
                        ) : (
                          <span>No image set</span>
                        )}
                      </div>
                      <div className="admin-shop-field">
                        <label htmlFor="shop-product-image">Image URL</label>
                        <input
                          id="shop-product-image"
                          value={imageUrl}
                          onChange={(event) => setImageUrl(event.target.value)}
                          placeholder="https://… or leave blank for default"
                        />
                      </div>
                    </div>
                  </section>

                  <section className="admin-shop-wc-panel">
                    <header className="admin-shop-wc-panel-head">
                      <h3>Product categories</h3>
                    </header>
                    <div className="admin-shop-wc-panel-body">
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
                      <p className="admin-shop-hint">
                        Organization for catalog filtering. Digital products are
                        locked to DIGITAL.
                      </p>
                    </div>
                  </section>
                </aside>
              </div>
            </div>
          </form>
        </div>
      </div>
    </DashboardModalPortal>
  );
}
