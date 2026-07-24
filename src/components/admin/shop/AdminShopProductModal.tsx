"use client";

import { useEffect, useId, useRef, useState } from "react";
import { DashboardModalPortal } from "@/components/ui/DashboardModalPortal";
import { SHOP_IMAGES_PER_PRODUCT_MAX } from "@/lib/shop/constants";
import type {
  AdminInventoryRowDto,
  ShopProductFormInput,
  ShopVariantFormInput,
} from "@/types/admin-shop";

const CATEGORIES = [
  "UNIFORM",
  "HEADWEAR",
  "INSIGNIA",
  "PATCHES",
  "ID",
  "DIGITAL",
] as const;

type ProductDataTab = "general" | "inventory" | "variants" | "advanced";

type AdminShopProductModalProps = {
  mode: "create" | "edit";
  product: AdminInventoryRowDto | null;
  saving: boolean;
  error: string | null;
  onClose: () => void;
  onSave: (input: ShopProductFormInput) => void;
};

function emptyVariant(): ShopVariantFormInput {
  return {
    sku: "",
    label: "",
    size: "",
    color: "",
    price: 0,
    stockQuantity: 0,
    isActive: true,
  };
}

function productHasVariableVariants(product: AdminInventoryRowDto): boolean {
  return (
    product.variantCount > 1 ||
    product.variants.some((v) => Boolean(v.size?.trim() || v.color?.trim()))
  );
}

export function AdminShopProductModal({
  mode,
  product,
  saving,
  error,
  onClose,
  onSave,
}: AdminShopProductModalProps) {
  const titleId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dataTab, setDataTab] = useState<ProductDataTab>("general");
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [category, setCategory] = useState<string>("UNIFORM");
  const [price, setPrice] = useState("");
  const [stockQuantity, setStockQuantity] = useState("0");
  const [stockThreshold, setStockThreshold] = useState("10");
  const [description, setDescription] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isActive, setIsActive] = useState(true);
  const [isDigital, setIsDigital] = useState(false);
  const [isVariable, setIsVariable] = useState(false);
  const [variants, setVariants] = useState<ShopVariantFormInput[]>([emptyVariant()]);
  const [minTierCode, setMinTierCode] = useState("");
  const [exactTierCode, setExactTierCode] = useState("");
  const [requiredWingCode, setRequiredWingCode] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    setDataTab("general");
    setUploadError(null);
    if (mode === "edit" && product) {
      setName(product.name);
      setSku(product.sku);
      setCategory(product.category);
      setPrice(String(product.price));
      setStockQuantity(String(product.stockQuantity));
      setStockThreshold("10");
      setDescription(product.description);
      setImageUrls(
        product.imageUrls.length
          ? product.imageUrls
          : product.imageSrc
            ? [product.imageSrc]
            : [],
      );
      setIsActive(product.isActive);
      setIsDigital(product.category === "DIGITAL");
      setMinTierCode(product.minTierCode ?? "");
      setExactTierCode(product.exactTierCode ?? "");
      setRequiredWingCode(product.requiredWingCode ?? "");
      const variable = productHasVariableVariants(product);
      setIsVariable(variable);
      if (product.variants.length) {
        setVariants(
          product.variants.map((v) => ({
            id: v.id,
            sku: v.sku,
            label: v.label,
            size: v.size ?? "",
            color: v.color ?? "",
            price: v.price,
            stockQuantity: v.stockQuantity,
            isActive: v.isActive,
          })),
        );
      } else {
        setVariants([
          {
            sku: product.sku,
            label: product.name,
            size: "",
            color: "",
            price: product.price,
            stockQuantity: product.stockQuantity,
            isActive: true,
          },
        ]);
      }
    } else {
      setName("");
      setSku("");
      setCategory("UNIFORM");
      setPrice("");
      setStockQuantity("10");
      setStockThreshold("10");
      setDescription("");
      setImageUrls([]);
      setIsActive(true);
      setIsDigital(false);
      setIsVariable(false);
      setVariants([emptyVariant()]);
      setMinTierCode("");
      setExactTierCode("");
      setRequiredWingCode("");
    }
  }, [mode, product]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !saving) onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, saving]);

  function updateVariant(index: number, patch: Partial<ShopVariantFormInput>) {
    setVariants((prev) =>
      prev.map((row, i) => (i === index ? { ...row, ...patch } : row)),
    );
  }

  function addVariantRow() {
    setVariants((prev) => [...prev, emptyVariant()]);
  }

  function removeVariantRow(index: number) {
    setVariants((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)));
  }

  async function handleImageUpload(file: File) {
    if (imageUrls.length >= SHOP_IMAGES_PER_PRODUCT_MAX) {
      setUploadError(`Maximum ${SHOP_IMAGES_PER_PRODUCT_MAX} images per product.`);
      return;
    }
    setUploading(true);
    setUploadError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      if (name.trim()) form.append("name", name.trim());
      const res = await fetch("/api/admin/shop/products/upload", {
        method: "POST",
        body: form,
      });
      const json = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !json.url) {
        setUploadError(json.error ?? "Image upload failed.");
        return;
      }
      setImageUrls((prev) => [...prev, json.url!]);
    } catch {
      setUploadError("Image upload failed.");
    } finally {
      setUploading(false);
    }
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const parsedPrice = parseFloat(price);
    const parsedStock = parseInt(stockQuantity, 10);
    const parsedThreshold = parseInt(stockThreshold, 10);

    let payloadVariants: ShopVariantFormInput[];
    if (isVariable) {
      payloadVariants = variants.map((v) => ({
        ...v,
        sku: v.sku.trim().toUpperCase(),
        label: v.label.trim() || name.trim(),
        size: v.size.trim(),
        color: v.color.trim(),
        price: Number(v.price),
        stockQuantity: Math.max(0, Number(v.stockQuantity) || 0),
      }));
    } else {
      payloadVariants = [
        {
          id: variants[0]?.id,
          sku: sku.trim().toUpperCase(),
          label: name.trim(),
          size: "",
          color: "",
          price: parsedPrice,
          stockQuantity: Number.isFinite(parsedStock) ? parsedStock : 0,
          isActive: true,
        },
      ];
    }

    onSave({
      name: name.trim(),
      sku: sku.trim().toUpperCase(),
      category: isDigital ? "DIGITAL" : category,
      price: parsedPrice,
      stockQuantity: Number.isFinite(parsedStock) ? parsedStock : 0,
      stockThreshold: Number.isFinite(parsedThreshold) ? parsedThreshold : 10,
      description: description.trim(),
      imageUrls: imageUrls.filter(Boolean),
      isActive,
      isDigital,
      isVariable,
      variants: payloadVariants,
      minTierCode,
      exactTierCode,
      requiredWingCode,
    });
  }

  const primaryPreview = imageUrls[0] ?? "";
  const tabs: Array<{ id: ProductDataTab; label: string }> = [
    { id: "general", label: "General" },
    { id: "inventory", label: "Inventory" },
    ...(isVariable ? [{ id: "variants" as const, label: "Variants" }] : []),
    { id: "advanced", label: "Advanced" },
  ];

  return (
    <DashboardModalPortal>
      <ShopModalBackdrop onClose={onClose} saving={saving}>
        <ShopModalDialog titleId={titleId} mode={mode} onClose={onClose} saving={saving}>
          <form className="admin-shop-modal-form--wc" onSubmit={handleSubmit}>
            <div className="admin-shop-modal-scroll">
              {error ? (
                <p className="admin-shop-banner admin-shop-banner--error" role="alert">
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
                <ShopModalMain
                  dataTab={dataTab}
                  setDataTab={setDataTab}
                  tabs={tabs}
                  isVariable={isVariable}
                  isDigital={isDigital}
                  description={description}
                  setDescription={setDescription}
                  price={price}
                  setPrice={setPrice}
                  sku={sku}
                  setSku={setSku}
                  stockQuantity={stockQuantity}
                  setStockQuantity={setStockQuantity}
                  stockThreshold={stockThreshold}
                  setStockThreshold={setStockThreshold}
                  mode={mode}
                  variants={variants}
                  updateVariant={updateVariant}
                  addVariantRow={addVariantRow}
                  removeVariantRow={removeVariantRow}
                  setIsDigital={setIsDigital}
                  setCategory={setCategory}
                  isVariableState={isVariable}
                  setIsVariable={setIsVariable}
                  minTierCode={minTierCode}
                  setMinTierCode={setMinTierCode}
                  exactTierCode={exactTierCode}
                  setExactTierCode={setExactTierCode}
                  requiredWingCode={requiredWingCode}
                  setRequiredWingCode={setRequiredWingCode}
                />

                <aside className="admin-shop-wc-side">
                  <section className="admin-shop-wc-panel">
                    <header className="admin-shop-wc-panel-head">
                      <h3>Publish</h3>
                    </header>
                    <div className="admin-shop-wc-panel-body admin-shop-wc-publish">
                      <ShopModalPublishRows isActive={isActive} />
                      <label className="admin-shop-check">
                        <input
                          type="checkbox"
                          checked={isActive}
                          onChange={(event) => setIsActive(event.target.checked)}
                        />
                        Active / visible in pilot shop
                      </label>
                      <ShopModalPublishActions
                        onClose={onClose}
                        saving={saving}
                        mode={mode}
                      />
                    </div>
                  </section>

                  <section className="admin-shop-wc-panel">
                    <header className="admin-shop-wc-panel-head">
                      <h3>Product gallery</h3>
                      <span className="admin-shop-wc-gallery-count">
                        {imageUrls.length}/{SHOP_IMAGES_PER_PRODUCT_MAX}
                      </span>
                    </header>
                    <GalleryPanel
                      imageUrls={imageUrls}
                      primaryPreview={primaryPreview}
                      uploading={uploading}
                      uploadError={uploadError}
                      fileInputRef={fileInputRef}
                      onRemove={(index) =>
                        setImageUrls((prev) => prev.filter((_, i) => i !== index))
                      }
                      onMove={(from, to) =>
                        setImageUrls((prev) => {
                          const next = [...prev];
                          const [item] = next.splice(from, 1);
                          if (item) next.splice(to, 0, item);
                          return next;
                        })
                      }
                      onUpload={handleImageUpload}
                    />
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
                        Organization for catalog filtering. Digital products are locked to
                        DIGITAL.
                      </p>
                    </div>
                  </section>
                </aside>
              </div>
            </div>
          </form>
        </ShopModalDialog>
      </ShopModalBackdrop>
    </DashboardModalPortal>
  );
}

function ShopModalBackdrop({
  children,
  onClose,
  saving,
}: {
  children: React.ReactNode;
  onClose: () => void;
  saving: boolean;
}) {
  return (
    <div
      className="admin-shop-modal-backdrop"
      role="presentation"
      onClick={() => {
        if (!saving) onClose();
      }}
    >
      {children}
    </div>
  );
}

function ShopModalDialog({
  children,
  titleId,
  mode,
  onClose,
  saving,
}: {
  children: React.ReactNode;
  titleId: string;
  mode: "create" | "edit";
  onClose: () => void;
  saving: boolean;
}) {
  return (
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
      {children}
    </div>
  );
}

function ShopModalPublishRows({ isActive }: { isActive: boolean }) {
  return (
    <>
      <div className="admin-shop-wc-publish-row">
        <span>Status</span>
        <strong>{isActive ? "Published" : "Draft"}</strong>
      </div>
      <ShopModalPublishRow isActive={isActive} />
    </>
  );
}

function ShopModalPublishRow({ isActive }: { isActive: boolean }) {
  return (
    <div className="admin-shop-wc-publish-row">
      <span>Visibility</span>
      <strong>{isActive ? "Shop catalog" : "Hidden"}</strong>
    </div>
  );
}

function ShopModalPublishActions({
  onClose,
  saving,
  mode,
}: {
  onClose: () => void;
  saving: boolean;
  mode: "create" | "edit";
}) {
  return (
    <div className="admin-shop-wc-publish-actions">
      <button
        type="button"
        className="admin-shop-btn-cancel"
        onClick={onClose}
        disabled={saving}
      >
        Cancel
      </button>
      <button type="submit" className="admin-shop-btn-save" disabled={saving}>
        {saving ? "Saving…" : mode === "create" ? "Publish" : "Update"}
      </button>
    </div>
  );
}

function ShopModalMain({
  dataTab,
  setDataTab,
  tabs,
  isVariable,
  isDigital,
  description,
  setDescription,
  price,
  setPrice,
  sku,
  setSku,
  stockQuantity,
  setStockQuantity,
  stockThreshold,
  setStockThreshold,
  mode,
  variants,
  updateVariant,
  addVariantRow,
  removeVariantRow,
  setIsDigital,
  setCategory,
  isVariableState,
  setIsVariable,
  minTierCode,
  setMinTierCode,
  exactTierCode,
  setExactTierCode,
  requiredWingCode,
  setRequiredWingCode,
}: {
  dataTab: ProductDataTab;
  setDataTab: (tab: ProductDataTab) => void;
  tabs: Array<{ id: ProductDataTab; label: string }>;
  isVariable: boolean;
  isDigital: boolean;
  description: string;
  setDescription: (v: string) => void;
  price: string;
  setPrice: (v: string) => void;
  sku: string;
  setSku: (v: string) => void;
  stockQuantity: string;
  setStockQuantity: (v: string) => void;
  stockThreshold: string;
  setStockThreshold: (v: string) => void;
  mode: "create" | "edit";
  variants: ShopVariantFormInput[];
  updateVariant: (index: number, patch: Partial<ShopVariantFormInput>) => void;
  addVariantRow: () => void;
  removeVariantRow: (index: number) => void;
  setIsDigital: (v: boolean) => void;
  setCategory: (v: string) => void;
  isVariableState: boolean;
  setIsVariable: (v: boolean) => void;
  minTierCode: string;
  setMinTierCode: (v: string) => void;
  exactTierCode: string;
  setExactTierCode: (v: string) => void;
  requiredWingCode: string;
  setRequiredWingCode: (v: string) => void;
}) {
  return (
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
            {isDigital
              ? "Digital / virtual"
              : isVariable
                ? "Variable product"
                : "Simple product"}
          </span>
        </header>
        <div className="admin-shop-wc-data">
          <nav className="admin-shop-wc-tabs" aria-label="Product data sections">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`admin-shop-wc-tab${dataTab === tab.id ? " is-active" : ""}`}
                onClick={() => setDataTab(tab.id)}
                aria-selected={dataTab === tab.id}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          <ProductDataTabPanel
            dataTab={dataTab}
            isVariable={isVariable}
            price={price}
            setPrice={setPrice}
            sku={sku}
            setSku={setSku}
            stockQuantity={stockQuantity}
            setStockQuantity={setStockQuantity}
            stockThreshold={stockThreshold}
            setStockThreshold={setStockThreshold}
            mode={mode}
            variants={variants}
            updateVariant={updateVariant}
            addVariantRow={addVariantRow}
            removeVariantRow={removeVariantRow}
            isDigital={isDigital}
            setIsDigital={setIsDigital}
            setCategory={setCategory}
            isVariableState={isVariableState}
            setIsVariable={setIsVariable}
            setDataTab={setDataTab}
            minTierCode={minTierCode}
            setMinTierCode={setMinTierCode}
            exactTierCode={exactTierCode}
            setExactTierCode={setExactTierCode}
            requiredWingCode={requiredWingCode}
            setRequiredWingCode={setRequiredWingCode}
          />
        </div>
      </section>
    </div>
  );
}

function ProductDataTabPanel({
  dataTab,
  isVariable,
  price,
  setPrice,
  sku,
  setSku,
  stockQuantity,
  setStockQuantity,
  stockThreshold,
  setStockThreshold,
  mode,
  variants,
  updateVariant,
  addVariantRow,
  removeVariantRow,
  isDigital,
  setIsDigital,
  setCategory,
  isVariableState,
  setIsVariable,
  setDataTab,
  minTierCode,
  setMinTierCode,
  exactTierCode,
  setExactTierCode,
  requiredWingCode,
  setRequiredWingCode,
}: {
  dataTab: ProductDataTab;
  isVariable: boolean;
  price: string;
  setPrice: (v: string) => void;
  sku: string;
  setSku: (v: string) => void;
  stockQuantity: string;
  setStockQuantity: (v: string) => void;
  stockThreshold: string;
  setStockThreshold: (v: string) => void;
  mode: "create" | "edit";
  variants: ShopVariantFormInput[];
  updateVariant: (index: number, patch: Partial<ShopVariantFormInput>) => void;
  addVariantRow: () => void;
  removeVariantRow: (index: number) => void;
  isDigital: boolean;
  setIsDigital: (v: boolean) => void;
  setCategory: (v: string) => void;
  isVariableState: boolean;
  setIsVariable: (v: boolean) => void;
  setDataTab: (tab: ProductDataTab) => void;
  minTierCode: string;
  setMinTierCode: (v: string) => void;
  exactTierCode: string;
  setExactTierCode: (v: string) => void;
  requiredWingCode: string;
  setRequiredWingCode: (v: string) => void;
}) {
  return (
    <div className="admin-shop-wc-tab-panel">
      {dataTab === "general" && !isVariable ? (
        <div className="admin-shop-wc-fields">
          <div className="admin-shop-field admin-shop-field--inline">
            <label htmlFor="shop-product-price">Regular price (USD)</label>
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
        </div>
      ) : null}

      {dataTab === "general" && isVariable ? (
        <p className="admin-shop-hint">
          Variable product — set price and stock per variant on the Variants tab.
        </p>
      ) : null}

      {dataTab === "inventory" ? (
        <InventoryFields
          isVariable={isVariable}
          sku={sku}
          setSku={setSku}
          stockQuantity={stockQuantity}
          setStockQuantity={setStockQuantity}
          stockThreshold={stockThreshold}
          setStockThreshold={setStockThreshold}
          mode={mode}
        />
      ) : null}

      {dataTab === "variants" && isVariable ? (
        <VariantTable
          variants={variants}
          updateVariant={updateVariant}
          addVariantRow={addVariantRow}
          removeVariantRow={removeVariantRow}
        />
      ) : null}

      {dataTab === "advanced" ? (
        <AdvancedFields
          isVariableState={isVariableState}
          setIsVariable={setIsVariable}
          setDataTab={setDataTab}
          isDigital={isDigital}
          setIsDigital={setIsDigital}
          setCategory={setCategory}
          minTierCode={minTierCode}
          setMinTierCode={setMinTierCode}
          exactTierCode={exactTierCode}
          setExactTierCode={setExactTierCode}
          requiredWingCode={requiredWingCode}
          setRequiredWingCode={setRequiredWingCode}
        />
      ) : null}
    </div>
  );
}

function InventoryFields({
  isVariable,
  sku,
  setSku,
  stockQuantity,
  setStockQuantity,
  stockThreshold,
  setStockThreshold,
  mode,
}: {
  isVariable: boolean;
  sku: string;
  setSku: (v: string) => void;
  stockQuantity: string;
  setStockQuantity: (v: string) => void;
  stockThreshold: string;
  setStockThreshold: (v: string) => void;
  mode: "create" | "edit";
}) {
  return (
    <div className="admin-shop-wc-fields">
      {!isVariable ? (
        <ShopSkuField sku={sku} setSku={setSku} mode={mode} />
      ) : null}
      <div className="admin-shop-field admin-shop-field--inline">
        <label htmlFor="shop-product-stock">
          {isVariable ? "Stock quantity (total)" : "Stock quantity"}
        </label>
        <input
          id="shop-product-stock"
          type="number"
          min={0}
          value={stockQuantity}
          onChange={(event) => setStockQuantity(event.target.value)}
          required={!isVariable}
          disabled={isVariable}
          readOnly={isVariable}
        />
      </div>
      <div className="admin-shop-field admin-shop-field--inline">
        <label htmlFor="shop-product-threshold">Low stock threshold</label>
        <input
          id="shop-product-threshold"
          type="number"
          min={1}
          value={stockThreshold}
          onChange={(event) => setStockThreshold(event.target.value)}
        />
      </div>
      <p className="admin-shop-hint">
        {isVariable
          ? "Total stock is the sum of all variant rows. Edit per-variant quantities on the Variants tab."
          : "Threshold is used for admin low-stock display. SKU cannot change after create."}
      </p>
    </div>
  );
}

function ShopSkuField({
  sku,
  setSku,
  mode,
}: {
  sku: string;
  setSku: (v: string) => void;
  mode: "create" | "edit";
}) {
  return (
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
  );
}

function AdvancedFields({
  isVariableState,
  setIsVariable,
  setDataTab,
  isDigital,
  setIsDigital,
  setCategory,
  minTierCode,
  setMinTierCode,
  exactTierCode,
  setExactTierCode,
  requiredWingCode,
  setRequiredWingCode,
}: {
  isVariableState: boolean;
  setIsVariable: (v: boolean) => void;
  setDataTab: (tab: ProductDataTab) => void;
  isDigital: boolean;
  setIsDigital: (v: boolean) => void;
  setCategory: (v: string) => void;
  minTierCode: string;
  setMinTierCode: (v: string) => void;
  exactTierCode: string;
  setExactTierCode: (v: string) => void;
  requiredWingCode: string;
  setRequiredWingCode: (v: string) => void;
}) {
  return (
    <div className="admin-shop-wc-fields">
      <label className="admin-shop-check">
        <input
          type="checkbox"
          checked={isVariableState}
          onChange={(event) => {
            const next = event.target.checked;
            setIsVariable(next);
            if (next) setDataTab("variants");
          }}
        />
        Variable product (size, color, per-variant inventory)
      </label>
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

      <div className="admin-shop-field">
        <label htmlFor="shop-min-tier">Minimum grade (optional)</label>
        <select
          id="shop-min-tier"
          value={minTierCode}
          onChange={(event) => setMinTierCode(event.target.value)}
        >
          <option value="">Any grade</option>
          <option value="A1_STUDENT">A-1 Student</option>
          <option value="A2_JUNIOR_FLIGHT_OFFICER">A-2 Jr Flight Officer</option>
          <option value="A3_FLIGHT_OFFICER">A-3 Flight Officer</option>
          <option value="A4_SENIOR_FLIGHT_OFFICER">A-4 Sr Flight Officer</option>
          <option value="A5_FIRST_OFFICER">A-5 First Officer</option>
          <option value="A6_CAPTAIN">A-6 Captain</option>
        </select>
        <p className="admin-shop-hint">
          e.g. Captain&apos;s Club polo → A-6 Captain
        </p>
      </div>

      <div className="admin-shop-field">
        <label htmlFor="shop-exact-tier">Exact grade only (optional)</label>
        <select
          id="shop-exact-tier"
          value={exactTierCode}
          onChange={(event) => setExactTierCode(event.target.value)}
        >
          <option value="">Not grade-locked</option>
          <option value="A1_STUDENT">A-1 Student</option>
          <option value="A2_JUNIOR_FLIGHT_OFFICER">A-2 Jr Flight Officer</option>
          <option value="A3_FLIGHT_OFFICER">A-3 Flight Officer</option>
          <option value="A4_SENIOR_FLIGHT_OFFICER">A-4 Sr Flight Officer</option>
          <option value="A5_FIRST_OFFICER">A-5 First Officer</option>
          <option value="A6_CAPTAIN">A-6 Captain</option>
        </select>
        <p className="admin-shop-hint">
          Use for epaulettes that must match the pilot&apos;s current grade.
        </p>
      </div>

      <div className="admin-shop-field">
        <label htmlFor="shop-required-wing">Required wing code (optional)</label>
        <input
          id="shop-required-wing"
          value={requiredWingCode}
          onChange={(event) => setRequiredWingCode(event.target.value)}
          placeholder="e.g. aviator-wings-senior"
        />
        <p className="admin-shop-hint">
          Pilot must already hold this wing award to see/order the item.
        </p>
      </div>
    </div>
  );
}

function VariantTable({
  variants,
  updateVariant,
  addVariantRow,
  removeVariantRow,
}: {
  variants: ShopVariantFormInput[];
  updateVariant: (index: number, patch: Partial<ShopVariantFormInput>) => void;
  addVariantRow: () => void;
  removeVariantRow: (index: number) => void;
}) {
  return (
    <div className="admin-shop-variants-editor">
      <div className="admin-shop-variants-table-wrap">
        <table className="admin-shop-variants-table">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Label</th>
              <th>Size</th>
              <th>Color</th>
              <th>Price</th>
              <th>Stock</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {variants.map((row, index) => (
              <tr key={row.id ?? `new-${index}`}>
                <td>
                  <input
                    value={row.sku}
                    onChange={(e) => updateVariant(index, { sku: e.target.value })}
                    required
                    placeholder="SKU"
                    aria-label={`Variant ${index + 1} SKU`}
                  />
                </td>
                <td>
                  <input
                    value={row.label}
                    onChange={(e) => updateVariant(index, { label: e.target.value })}
                    placeholder="Label"
                    aria-label={`Variant ${index + 1} label`}
                  />
                </td>
                <td>
                  <input
                    value={row.size}
                    onChange={(e) => updateVariant(index, { size: e.target.value })}
                    placeholder="S, M, L…"
                    aria-label={`Variant ${index + 1} size`}
                  />
                </td>
                <td>
                  <input
                    value={row.color}
                    onChange={(e) => updateVariant(index, { color: e.target.value })}
                    placeholder="Black, Navy…"
                    aria-label={`Variant ${index + 1} color`}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={row.price || ""}
                    onChange={(e) =>
                      updateVariant(index, { price: parseFloat(e.target.value) || 0 })
                    }
                    required
                    aria-label={`Variant ${index + 1} price`}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min={0}
                    value={row.stockQuantity}
                    onChange={(e) =>
                      updateVariant(index, {
                        stockQuantity: parseInt(e.target.value, 10) || 0,
                      })
                    }
                    aria-label={`Variant ${index + 1} stock`}
                  />
                </td>
                <td>
                  <button
                    type="button"
                    className="admin-shop-variant-remove"
                    onClick={() => removeVariantRow(index)}
                    disabled={variants.length <= 1}
                    aria-label={`Remove variant ${index + 1}`}
                  >
                    ×
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button type="button" className="admin-shop-variant-add" onClick={addVariantRow}>
        + Add variant
      </button>
    </div>
  );
}

function GalleryPanel({
  imageUrls,
  primaryPreview,
  uploading,
  uploadError,
  fileInputRef,
  onRemove,
  onMove,
  onUpload,
}: {
  imageUrls: string[];
  primaryPreview: string;
  uploading: boolean;
  uploadError: string | null;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onRemove: (index: number) => void;
  onMove: (from: number, to: number) => void;
  onUpload: (file: File) => void;
}) {
  return (
    <ShopGalleryPanelBody
      imageUrls={imageUrls}
      primaryPreview={primaryPreview}
      uploading={uploading}
      uploadError={uploadError}
      fileInputRef={fileInputRef}
      onRemove={onRemove}
      onMove={onMove}
      onUpload={onUpload}
    />
  );
}

function ShopGalleryPanelBody({
  imageUrls,
  primaryPreview,
  uploading,
  uploadError,
  fileInputRef,
  onRemove,
  onMove,
  onUpload,
}: {
  imageUrls: string[];
  primaryPreview: string;
  uploading: boolean;
  uploadError: string | null;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onRemove: (index: number) => void;
  onMove: (from: number, to: number) => void;
  onUpload: (file: File) => void;
}) {
  return (
    <div className="admin-shop-wc-panel-body">
      <div className="admin-shop-wc-image-preview admin-shop-wc-image-preview--hero">
        {primaryPreview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={primaryPreview} alt="" />
        ) : (
          <span>No image set</span>
        )}
      </div>

      {imageUrls.length > 0 ? (
        <ul className="admin-shop-gallery-thumbs" aria-label="Product images">
          {imageUrls.map((url, index) => (
            <li key={`${url}-${index}`} className="admin-shop-gallery-thumb">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" />
              <div className="admin-shop-gallery-thumb-actions">
                <button
                  type="button"
                  className="admin-shop-gallery-thumb-btn"
                  disabled={index === 0}
                  onClick={() => onMove(index, index - 1)}
                  aria-label="Move left"
                >
                  ←
                </button>
                <button
                  type="button"
                  className="admin-shop-gallery-thumb-btn"
                  disabled={index >= imageUrls.length - 1}
                  onClick={() => onMove(index, index + 1)}
                  aria-label="Move right"
                >
                  →
                </button>
                <button
                  type="button"
                  className="admin-shop-gallery-thumb-btn admin-shop-gallery-thumb-btn--remove"
                  onClick={() => onRemove(index)}
                  aria-label="Remove image"
                >
                  ×
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="admin-shop-gallery-file-input"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void onUpload(file);
          event.target.value = "";
        }}
      />

      <button
        type="button"
        className="admin-shop-gallery-upload-btn"
        disabled={uploading || imageUrls.length >= SHOP_IMAGES_PER_PRODUCT_MAX}
        onClick={() => fileInputRef.current?.click()}
      >
        {uploading
          ? "Uploading…"
          : imageUrls.length >= SHOP_IMAGES_PER_PRODUCT_MAX
            ? "Gallery full"
            : "Upload image"}
      </button>

      {uploadError ? (
        <p className="admin-shop-banner admin-shop-banner--error" role="alert">
          {uploadError}
        </p>
      ) : null}

      <p className="admin-shop-hint">
        Up to {SHOP_IMAGES_PER_PRODUCT_MAX} images (PNG, JPEG, WebP). First image is the
        catalog thumbnail.
      </p>
    </div>
  );
}
