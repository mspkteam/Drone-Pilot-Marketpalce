"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  formatShopPrice,
  imageForVariant,
  mapProductForDisplay,
  type ShopDisplayProduct,
} from "@/lib/pilot/shop-display-map";
import { UNIFORM_SHIPPING_FLAT_RATE } from "@/lib/shop/constants";
import type { UniformProductDto } from "@/types/shop";

type CartLine = { variantId: string; quantity: number };

function CartIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M2 2h1.2l1.1 6.2h7.4l1.4-4.4H4.8"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="6.2" cy="12.8" r="0.9" fill="currentColor" />
      <circle cx="11.4" cy="12.8" r="0.9" fill="currentColor" />
    </svg>
  );
}

export function PilotUniformShop() {
  const [products, setProducts] = useState<UniformProductDto[]>([]);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [previewVariantId, setPreviewVariantId] = useState<string | null>(null);
  const [shippingName, setShippingName] = useState("");
  const [shippingLine1, setShippingLine1] = useState("");
  const [shippingLine2, setShippingLine2] = useState("");
  const [shippingCity, setShippingCity] = useState("");
  const [shippingRegion, setShippingRegion] = useState("");
  const [shippingPostal, setShippingPostal] = useState("");
  const [shippingPhone, setShippingPhone] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/pilot/shop/products");
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to load catalog.");
        setProducts([]);
      } else {
        setProducts(data.products ?? []);
      }
    } catch {
      setError("Failed to load catalog.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const displayProducts = useMemo(
    () =>
      products
        .map(mapProductForDisplay)
        .filter((item): item is ShopDisplayProduct => item !== null),
    [products],
  );

  const variantIndex = useMemo(() => {
    const map = new Map<
      string,
      UniformProductDto["variants"][number] & { productName: string }
    >();
    for (const product of products) {
      for (const variant of product.variants) {
        map.set(variant.id, { ...variant, productName: product.name });
      }
    }
    return map;
  }, [products]);

  const cartDetails = useMemo(() => {
    return cart
      .map((line) => {
        const variant = variantIndex.get(line.variantId);
        if (!variant) return null;
        return { ...line, variant };
      })
      .filter(Boolean) as Array<{
      variantId: string;
      quantity: number;
      variant: UniformProductDto["variants"][number] & { productName: string };
    }>;
  }, [cart, variantIndex]);

  const subtotal = cartDetails.reduce(
    (sum, line) => sum + line.variant.price * line.quantity,
    0,
  );

  const cartPreviewSrc = useMemo(() => {
    if (previewVariantId) {
      return imageForVariant(previewVariantId, displayProducts);
    }
    if (cartDetails[0]) {
      return imageForVariant(cartDetails[0].variantId, displayProducts);
    }
    return displayProducts[0]?.imageSrc ?? "/images/shop-placeholder.png";
  }, [previewVariantId, cartDetails, displayProducts]);

  function addToCart(variantId: string) {
    setPreviewVariantId(variantId);
    setCart((prev) => {
      const existing = prev.find((line) => line.variantId === variantId);
      if (existing) {
        return prev.map((line) =>
          line.variantId === variantId
            ? { ...line, quantity: line.quantity + 1 }
            : line,
        );
      }
      return [...prev, { variantId, quantity: 1 }];
    });
  }

  function updateQty(variantId: string, quantity: number) {
    if (quantity < 1) {
      setCart((prev) => prev.filter((line) => line.variantId !== variantId));
      return;
    }
    setCart((prev) =>
      prev.map((line) => (line.variantId === variantId ? { ...line, quantity } : line)),
    );
  }

  async function placeOrder(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/pilot/shop/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart,
          shippingName,
          shippingLine1,
          shippingLine2: shippingLine2 || null,
          shippingCity,
          shippingRegion: shippingRegion || null,
          shippingPostal,
          shippingPhone: shippingPhone || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Checkout failed.");
      } else {
        setCart([]);
        setCheckoutOpen(false);
        window.location.href = `/dashboard/pilot/shop/orders/${data.order.id}`;
      }
    } catch {
      setError("Checkout failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="pilot-shop-page">
      <Link href="/dashboard/pilot" className="pilot-shop-back">
        ← Back
      </Link>

      <header className="pilot-shop-header">
        <p className="pilot-shop-eyebrow">BUSINESS / SHOP</p>
        <h1 className="pilot-shop-title">Uniform &amp; Insignia Shop</h1>
      </header>

      {error ? (
        <p className="pilot-shop-banner" role="alert">
          {error}
        </p>
      ) : null}

      <p className="pilot-shop-note">
        Official marketplace apparel and insignia. Flat ${UNIFORM_SHIPPING_FLAT_RATE}{" "}
        shipping is added at checkout (separate from job escrow).
      </p>

      {loading ? (
        <p className="pilot-shop-loading">Loading catalog…</p>
      ) : displayProducts.length === 0 ? (
        <p className="pilot-shop-empty">
          No shop products are available yet. Check back after the catalog is seeded.
        </p>
      ) : (
        <div className="pilot-shop-layout">
          <ul className="pilot-shop-grid">
            {displayProducts.map((item) => (
                  <li key={item.productId} className="pilot-shop-card">
                    <div className="pilot-shop-card-media">
                      <Image
                        src={item.imageSrc}
                        alt=""
                        width={220}
                        height={180}
                        className="pilot-shop-card-image"
                      />
                    </div>
                    <span className="pilot-shop-card-badge">{item.category}</span>
                    <h2 className="pilot-shop-card-name">{item.name}</h2>
                    {item.variantCount > 1 ? (
                      <p className="pilot-shop-card-variant">{item.variant.label}</p>
                    ) : null}
                    <div className="pilot-shop-card-footer">
                      <span className="pilot-shop-card-price">
                        {formatShopPrice(item.displayPrice)}
                      </span>
                      <button
                        type="button"
                        className="pilot-shop-add-btn"
                        disabled={item.variant.stockQuantity < 1}
                        onClick={() => addToCart(item.variant.id)}
                      >
                        + ADD
                      </button>
                    </div>
                  </li>
                ))}
          </ul>

          <aside className="pilot-shop-cart" aria-label="Shopping cart">
            <div className="pilot-shop-cart-media">
              <Image
                src={cartPreviewSrc}
                alt=""
                width={220}
                height={180}
                className="pilot-shop-cart-image"
              />
            </div>
            <h2 className="pilot-shop-cart-head">CART</h2>
            <Link href="/dashboard/pilot/shop/orders" className="pilot-shop-orders-link">
              My orders →
            </Link>

            {cartDetails.length === 0 ? (
              <p className="pilot-shop-cart-empty">Cart is empty.</p>
            ) : (
              <>
                <ul className="pilot-shop-cart-items">
                  {cartDetails.map((line) => (
                    <li key={line.variantId} className="pilot-shop-cart-item">
                      <span className="pilot-shop-cart-item-name">
                        {line.variant.productName}
                      </span>
                      <div className="pilot-shop-cart-item-meta">
                        <input
                          type="number"
                          min={1}
                          max={line.variant.stockQuantity}
                          value={line.quantity}
                          onChange={(e) =>
                            updateQty(line.variantId, parseInt(e.target.value, 10) || 1)
                          }
                          className="pilot-shop-cart-qty"
                          aria-label={`Quantity for ${line.variant.productName}`}
                        />
                        <span className="pilot-shop-cart-item-price">
                          {formatShopPrice(line.variant.price * line.quantity)}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="pilot-shop-cart-subtotal">
                  <span className="pilot-shop-cart-subtotal-label">SUBTOTAL</span>
                  <span className="pilot-shop-cart-subtotal-value">
                    {formatShopPrice(subtotal)}
                  </span>
                </div>

                <div className="pilot-shop-cart-actions">
                  <button
                    type="button"
                    className="pilot-shop-checkout-btn"
                    onClick={() => setCheckoutOpen(true)}
                  >
                    <CartIcon />
                    Checkout
                  </button>
                </div>
              </>
            )}

            {checkoutOpen ? (
              <form onSubmit={(e) => void placeOrder(e)} className="pilot-shop-checkout-form">
                <p className="pilot-shop-checkout-form-title">Shipping address</p>
                <div className="pilot-shop-field">
                  <label htmlFor="ship-name">Full name</label>
                  <input
                    id="ship-name"
                    value={shippingName}
                    onChange={(e) => setShippingName(e.target.value)}
                    required
                  />
                </div>
                <div className="pilot-shop-field">
                  <label htmlFor="ship-line1">Address line 1</label>
                  <input
                    id="ship-line1"
                    value={shippingLine1}
                    onChange={(e) => setShippingLine1(e.target.value)}
                    required
                  />
                </div>
                <div className="pilot-shop-field">
                  <label htmlFor="ship-line2">Address line 2</label>
                  <input
                    id="ship-line2"
                    value={shippingLine2}
                    onChange={(e) => setShippingLine2(e.target.value)}
                  />
                </div>
                <div className="pilot-shop-field">
                  <label htmlFor="ship-city">City</label>
                  <input
                    id="ship-city"
                    value={shippingCity}
                    onChange={(e) => setShippingCity(e.target.value)}
                    required
                  />
                </div>
                <div className="pilot-shop-field">
                  <label htmlFor="ship-region">State / region</label>
                  <input
                    id="ship-region"
                    value={shippingRegion}
                    onChange={(e) => setShippingRegion(e.target.value)}
                  />
                </div>
                <div className="pilot-shop-field">
                  <label htmlFor="ship-postal">Postal code</label>
                  <input
                    id="ship-postal"
                    value={shippingPostal}
                    onChange={(e) => setShippingPostal(e.target.value)}
                    required
                  />
                </div>
                <div className="pilot-shop-field">
                  <label htmlFor="ship-phone">Phone</label>
                  <input
                    id="ship-phone"
                    value={shippingPhone}
                    onChange={(e) => setShippingPhone(e.target.value)}
                  />
                </div>
                <div className="pilot-shop-form-actions">
                  <button type="submit" className="pilot-shop-place-btn" disabled={submitting}>
                    {submitting ? "Placing…" : "Place order"}
                  </button>
                  <button
                    type="button"
                    className="pilot-shop-cancel-btn"
                    onClick={() => setCheckoutOpen(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : null}
          </aside>
        </div>
      )}
    </div>
  );
}
