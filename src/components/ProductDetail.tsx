"use client";

import Link from "next/link";
import { useState } from "react";
import { CoverArt } from "@/components/CoverArt";
import { type Product } from "@/lib/mock-data";

export function ProductDetail({ product }: { product: Product }) {
  const [variant, setVariant] = useState(product.variants?.[0]);
  const [added, setAdded] = useState(false);

  function addToCart() {
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
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
            <p className="mt-4 font-display text-4xl text-zinc-200">${product.price}</p>

            <p className="mt-6 max-w-prose text-base leading-relaxed text-zinc-300">
              {product.description}
            </p>

            {product.variants && (
              <div className="mt-8">
                <p className="text-eyebrow mb-3">Size</p>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setVariant(item)}
                      className={`min-w-12 rounded-md border px-4 py-2 text-xs uppercase tracking-widest transition-colors ${
                        variant === item
                          ? "border-accent bg-accent text-background"
                          : "border-white/10 hover:border-accent hover:text-accent"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={addToCart}
              className="mt-10 w-full rounded-full bg-accent py-4 text-[11px] uppercase tracking-[0.3em] text-background transition-colors hover:bg-accent/80 md:w-auto md:px-12"
            >
              {added ? "Added" : product.digital ? "Buy & Download" : "Add to Cart"}
            </button>

            <p className="mt-6 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              Checkout via Stripe wires on when the backend is enabled.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
