"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { FormField, inputClassName } from "@/components/ui/FormField";
import { UNIFORM_SHIPPING_FLAT_RATE } from "@/lib/shop/constants";
import type { UniformProductDto } from "@/types/shop";

type CartLine = { variantId: string; quantity: number };

export function PilotUniformShop() {
  const [products, setProducts] = useState<UniformProductDto[]>([]);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
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

  const variantIndex = useMemo(() => {
    const map = new Map<
      string,
      UniformProductDto["variants"][number] & { productName: string }
    >();
    for (const p of products) {
      for (const v of p.variants) {
        map.set(v.id, { ...v, productName: p.name });
      }
    }
    return map;
  }, [products]);

  const cartDetails = useMemo(() => {
    return cart
      .map((line) => {
        const v = variantIndex.get(line.variantId);
        if (!v) return null;
        return { ...line, variant: v };
      })
      .filter(Boolean) as Array<{
      variantId: string;
      quantity: number;
      variant: UniformProductDto["variants"][number] & { productName: string };
    }>;
  }, [cart, variantIndex]);

  const subtotal = cartDetails.reduce(
    (sum, l) => sum + l.variant.price * l.quantity,
    0,
  );
  const total = subtotal + (cartDetails.length > 0 ? UNIFORM_SHIPPING_FLAT_RATE : 0);

  function addToCart(variantId: string) {
    setCart((prev) => {
      const existing = prev.find((l) => l.variantId === variantId);
      if (existing) {
        return prev.map((l) =>
          l.variantId === variantId
            ? { ...l, quantity: l.quantity + 1 }
            : l,
        );
      }
      return [...prev, { variantId, quantity: 1 }];
    });
  }

  function updateQty(variantId: string, quantity: number) {
    if (quantity < 1) {
      setCart((prev) => prev.filter((l) => l.variantId !== variantId));
      return;
    }
    setCart((prev) =>
      prev.map((l) => (l.variantId === variantId ? { ...l, quantity } : l)),
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

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading catalog…</p>;
  }

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        <p className="text-sm text-muted-foreground">
          Official marketplace apparel and gear. Orders use a separate shop
          payment flow (not job escrow). Flat ${UNIFORM_SHIPPING_FLAT_RATE}{" "}
          shipping.
        </p>
        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
        {products.length === 0 ? (
          <p className="text-sm text-muted-foreground">No products available.</p>
        ) : (
          <ul className="space-y-6">
            {products.map((product) => (
              <li
                key={product.id}
                className="rounded-lg border border-border bg-surface-elevated p-5"
              >
                <h3 className="font-semibold">{product.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {product.description}
                </p>
                <ul className="mt-4 space-y-2">
                  {product.variants.map((v) => (
                    <li
                      key={v.id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border px-3 py-2 text-sm"
                    >
                      <span>
                        {v.label} · ${v.price.toFixed(2)}{" "}
                        <span className="text-muted-foreground">
                          ({v.stockQuantity} in stock)
                        </span>
                      </span>
                      <Button
                        type="button"
                        size="sm"
                        disabled={v.stockQuantity < 1}
                        onClick={() => addToCart(v.id)}
                      >
                        Add
                      </Button>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </div>

      <aside className="rounded-lg border border-border bg-surface-elevated p-5 h-fit lg:sticky lg:top-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Cart</h2>
          <Link
            href="/dashboard/pilot/shop/orders"
            className="text-sm text-gold-dark hover:underline"
          >
            My orders
          </Link>
        </div>
        {cartDetails.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">Cart is empty.</p>
        ) : (
          <>
            <ul className="mt-4 space-y-2 text-sm">
              {cartDetails.map((line) => (
                <li key={line.variantId} className="flex justify-between gap-2">
                  <span>
                    {line.variant.productName} ({line.variant.label}) ×{" "}
                    <input
                      type="number"
                      min={1}
                      max={line.variant.stockQuantity}
                      value={line.quantity}
                      onChange={(e) =>
                        updateQty(line.variantId, parseInt(e.target.value, 10) || 1)
                      }
                      className="w-12 rounded border border-border px-1 text-center"
                    />
                  </span>
                  <span>${(line.variant.price * line.quantity).toFixed(2)}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-4 space-y-1 border-t border-border pt-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd>${subtotal.toFixed(2)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Shipping</dt>
                <dd>${UNIFORM_SHIPPING_FLAT_RATE.toFixed(2)}</dd>
              </div>
              <div className="flex justify-between font-medium">
                <dt>Total</dt>
                <dd>${total.toFixed(2)}</dd>
              </div>
            </dl>
            <Button
              type="button"
              className="mt-4 w-full"
              onClick={() => setCheckoutOpen(true)}
            >
              Checkout
            </Button>
          </>
        )}

        {checkoutOpen ? (
          <form
            onSubmit={(e) => void placeOrder(e)}
            className="mt-6 space-y-3 border-t border-border pt-4"
          >
            <p className="text-sm font-medium">Shipping address</p>
            <FormField label="Full name" htmlFor="ship-name">
              <input
                id="ship-name"
                className={inputClassName}
                value={shippingName}
                onChange={(e) => setShippingName(e.target.value)}
                required
              />
            </FormField>
            <FormField label="Address line 1" htmlFor="ship-line1">
              <input
                id="ship-line1"
                className={inputClassName}
                value={shippingLine1}
                onChange={(e) => setShippingLine1(e.target.value)}
                required
              />
            </FormField>
            <FormField label="Address line 2" htmlFor="ship-line2">
              <input
                id="ship-line2"
                className={inputClassName}
                value={shippingLine2}
                onChange={(e) => setShippingLine2(e.target.value)}
              />
            </FormField>
            <FormField label="City" htmlFor="ship-city">
              <input
                id="ship-city"
                className={inputClassName}
                value={shippingCity}
                onChange={(e) => setShippingCity(e.target.value)}
                required
              />
            </FormField>
            <FormField label="State / region" htmlFor="ship-region">
              <input
                id="ship-region"
                className={inputClassName}
                value={shippingRegion}
                onChange={(e) => setShippingRegion(e.target.value)}
              />
            </FormField>
            <FormField label="Postal code" htmlFor="ship-postal">
              <input
                id="ship-postal"
                className={inputClassName}
                value={shippingPostal}
                onChange={(e) => setShippingPostal(e.target.value)}
                required
              />
            </FormField>
            <FormField label="Phone" htmlFor="ship-phone">
              <input
                id="ship-phone"
                className={inputClassName}
                value={shippingPhone}
                onChange={(e) => setShippingPhone(e.target.value)}
              />
            </FormField>
            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={submitting}>
                {submitting ? "Placing…" : "Place order"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setCheckoutOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : null}
      </aside>
    </div>
  );
}
