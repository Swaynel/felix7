"use client";

import Link from "next/link";
import { useState } from "react";
import { CoverArt } from "@/components/CoverArt";
import type { SiteProduct, SiteProductVariant } from "@/lib/site-data";

export function ProductDetail({ product }: { product: SiteProduct }) {
  const [variant, setVariant] = useState<SiteProductVariant | undefined>(product.variants[0]);
  const [email, setEmail] = useState("");
  const [shippingAddress, setShippingAddress] = useState({
    line1: "",
    city: "",
    country: "",
    postcode: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function checkout() {
    if (!variant?.id) {
      setStatus("error");
      setMessage("This product needs a synced backend variant before checkout.");
      return;
    }

    setStatus("loading");
    setMessage("");

    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        items: [{ variantId: variant.id, quantity: 1 }],
        shippingAddress: product.digital ? undefined : shippingAddress,
      }),
    });

    const body = await response.json().catch(() => null) as
      | { authorizationUrl?: string; error?: string }
      | null;

    if (!response.ok || !body?.authorizationUrl) {
      setStatus("error");
      setMessage(body?.error ?? "Checkout could not be started.");
      return;
    }

    setStatus("success");
    window.location.href = body.authorizationUrl;
  }

  return (
    <section className="px-6 pt-32 pb-24">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/shop"
          className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground hover:text-accent"
        >
          &larr; Shop
        </Link>

        <div className="mt-10 grid grid-cols-1 gap-12 md:grid-cols-2">
          <CoverArt hue={product.cover.hue} label={product.cover.label} aspect="portrait" />

          <div>
            <p className="text-eyebrow">
              {product.category}
              {product.digital && " / Digital Download"}
            </p>
            <h1 className="mt-2 font-display text-6xl leading-none text-accent md:text-7xl">
              {product.name}
            </h1>
            <p className="mt-4 font-display text-4xl text-zinc-200">{product.priceLabel}</p>

            <p className="mt-6 max-w-prose text-base leading-relaxed text-zinc-300">
              {product.description}
            </p>

            {product.variants.length > 0 && (
              <div className="mt-8">
                <p className="text-eyebrow mb-3">{product.digital ? "Format" : "Variant"}</p>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((item) => (
                    <button
                      key={item.id ?? item.label}
                      type="button"
                      onClick={() => setVariant(item)}
                      className={`min-w-12 rounded-md border px-4 py-2 text-xs uppercase tracking-widest transition-colors ${
                        variant?.label === item.label
                          ? "border-accent bg-accent text-background"
                          : "border-white/10 hover:border-accent hover:text-accent"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-8 space-y-4">
              <div>
                <label className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  className="mt-2 w-full rounded-md border border-white/10 bg-surface/40 p-3 text-sm text-zinc-100 outline-none focus:border-accent"
                />
              </div>

              {!product.digital && (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <CheckoutField
                    label="Address"
                    value={shippingAddress.line1}
                    onChange={(line1) => setShippingAddress((current) => ({ ...current, line1 }))}
                  />
                  <CheckoutField
                    label="City"
                    value={shippingAddress.city}
                    onChange={(city) => setShippingAddress((current) => ({ ...current, city }))}
                  />
                  <CheckoutField
                    label="Country"
                    value={shippingAddress.country}
                    onChange={(country) => setShippingAddress((current) => ({ ...current, country }))}
                  />
                  <CheckoutField
                    label="Postcode"
                    value={shippingAddress.postcode}
                    required={false}
                    onChange={(postcode) => setShippingAddress((current) => ({ ...current, postcode }))}
                  />
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={checkout}
              disabled={status === "loading" || !email || (!product.digital && (!shippingAddress.line1 || !shippingAddress.city || !shippingAddress.country))}
              className="mt-10 w-full rounded-full bg-accent py-4 text-[11px] uppercase tracking-[0.3em] text-background transition-colors hover:bg-accent/80 md:w-auto md:px-12"
            >
              {status === "loading" ? "Starting Checkout" : product.digital ? "Buy & Download" : "Checkout"}
            </button>

            {message && (
              <p className={`mt-6 text-xs ${status === "error" ? "text-accent" : "text-zinc-300"}`}>
                {message}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function CheckoutField({
  label,
  value,
  onChange,
  required = true,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  return (
    <div>
      <label className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
        {label}
      </label>
      <input
        value={value}
        required={required}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-md border border-white/10 bg-surface/40 p-3 text-sm text-zinc-100 outline-none focus:border-accent"
      />
    </div>
  );
}
