"use client";

import Link from "next/link";
import { useState } from "react";
import { CoverArt } from "@/components/CoverArt";
import { products, type Product } from "@/lib/mock-data";

const CATEGORIES = ["All", "Apparel", "Vinyl", "Digital", "Accessory"] as const;
type Category = (typeof CATEGORIES)[number];

export function ShopCatalog() {
  const [filter, setFilter] = useState<Category>("All");
  const list: Product[] =
    filter === "All" ? products : products.filter((product) => product.category === filter);

  return (
    <section className="px-6 pt-32 pb-24">
      <div className="mx-auto max-w-7xl">
        <header className="mb-12 flex flex-col gap-6 border-b border-white/5 pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="font-display text-7xl text-accent md:text-8xl">Shop</h1>
            <p className="mt-2 text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
              Apparel / Vinyl / Digital
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setFilter(category)}
                className={`rounded-full border px-4 py-1.5 text-[10px] uppercase tracking-widest transition-colors ${
                  filter === category
                    ? "border-accent bg-accent text-background"
                    : "border-white/10 text-muted-foreground hover:border-accent hover:text-accent"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </header>

        <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((product) => (
            <Link
              key={product.slug}
              href={`/shop/${product.slug}`}
              className="group block space-y-4"
            >
              <CoverArt
                hue={product.cover.hue}
                label={product.cover.label}
                aspect="portrait"
                className="transition-transform group-hover:-translate-y-1"
              />
              <div>
                <div className="flex items-baseline justify-between">
                  <h2 className="text-sm uppercase tracking-widest transition-colors group-hover:text-accent">
                    {product.name}
                  </h2>
                  <span className="text-sm text-accent">${product.price}</span>
                </div>
                <p className="mt-1 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                  {product.category}
                  {product.digital && " / Download"}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
