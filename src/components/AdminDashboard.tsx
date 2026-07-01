"use client";

import { useState } from "react";
import { products, releases, shows } from "@/lib/mock-data";

const TABS = ["Releases", "Shows", "Merch", "Orders", "Press Kit"] as const;
type Tab = (typeof TABS)[number];

export function AdminDashboard() {
  const [tab, setTab] = useState<Tab>("Releases");
  const [authed, setAuthed] = useState(false);

  if (!authed) {
    return (
      <section className="grid min-h-screen place-items-center bg-background px-6">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setAuthed(true);
          }}
          className="w-full max-w-sm space-y-6 rounded-md border border-white/5 bg-surface/40 p-8"
        >
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              Restricted
            </p>
            <h1 className="mt-1 font-display text-4xl text-accent">Artery Admin</h1>
          </div>
          <input
            type="email"
            placeholder="email"
            required
            className="w-full rounded-md border border-white/10 bg-background p-3 text-sm outline-none focus:border-accent"
          />
          <input
            type="password"
            placeholder="password"
            required
            className="w-full rounded-md border border-white/10 bg-background p-3 text-sm outline-none focus:border-accent"
          />
          <button
            type="submit"
            className="w-full rounded-full bg-accent py-3 text-[11px] uppercase tracking-[0.3em] text-background hover:bg-accent/80"
          >
            Enter
          </button>
          <p className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground">
            Auth wires to the backend when enabled. Currently a stub.
          </p>
        </form>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-background px-6 pt-32 pb-24">
      <div className="mx-auto max-w-7xl">
        <header className="mb-10 flex items-end justify-between border-b border-white/5 pb-6">
          <div>
            <p className="text-eyebrow">Restricted</p>
            <h1 className="mt-1 font-display text-6xl text-accent">Dashboard</h1>
          </div>
          <button
            type="button"
            onClick={() => setAuthed(false)}
            className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground hover:text-accent"
          >
            Sign out
          </button>
        </header>

        <div className="mb-10 grid grid-cols-2 gap-4 md:grid-cols-4">
          <Stat label="Releases" value={releases.length} />
          <Stat label="Upcoming Shows" value={shows.length} />
          <Stat label="Products" value={products.length} />
          <Stat label="Open Orders" value={7} />
        </div>

        <div className="mb-6 flex flex-wrap gap-2 border-b border-white/5 pb-3">
          {TABS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setTab(item)}
              className={`rounded-full px-4 py-1.5 text-[10px] uppercase tracking-widest transition-colors ${
                tab === item ? "bg-accent text-background" : "text-muted-foreground hover:text-accent"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto rounded-md border border-white/5">
          {tab === "Releases" && (
            <Table
              head={["Title", "Type", "Year", "Tracks", ""]}
              rows={releases.map((release) => [
                release.title,
                release.type,
                String(release.year),
                String(release.tracks.length),
                "Edit",
              ])}
            />
          )}
          {tab === "Shows" && (
            <Table
              head={["Date", "City", "Venue", "Status", ""]}
              rows={shows.map((show) => [show.date, show.city, show.venue, show.status, "Edit"])}
            />
          )}
          {tab === "Merch" && (
            <Table
              head={["Name", "Category", "Price", "Variants", ""]}
              rows={products.map((product) => [
                product.name,
                product.category,
                `$${product.price}`,
                product.variants?.join(", ") ?? "-",
                "Edit",
              ])}
            />
          )}
          {tab === "Orders" && (
            <Table
              head={["Order #", "Customer", "Items", "Total", "Status"]}
              rows={[
                ["#1024", "j.morel@...", "Shroud Hoodie x1", "$85", "Paid"],
                ["#1023", "a.knox@...", "Blood Moon Vinyl x1", "$40", "Shipped"],
                ["#1022", "-", "Vesper Hour (Digital)", "$12", "Delivered"],
              ]}
            />
          )}
          {tab === "Press Kit" && (
            <Table
              head={["Asset", "Type", "Size", "Updated", ""]}
              rows={[
                ["Bio - long.pdf", "PDF", "412 KB", "2024-09-01", "Replace"],
                ["Press photo 01.jpg", "Image", "8.2 MB", "2024-08-22", "Replace"],
                ["Tech rider v2.3.pdf", "PDF", "208 KB", "2024-07-30", "Replace"],
                ["Stage plot v2.3.pdf", "PDF", "184 KB", "2024-07-30", "Replace"],
              ]}
            />
          )}
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-md border border-white/5 bg-surface/40 p-5">
      <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">{label}</div>
      <div className="mt-2 font-display text-4xl text-accent">{value}</div>
    </div>
  );
}

function Table({ head, rows }: { head: string[]; rows: string[][] }) {
  return (
    <table className="w-full min-w-[680px] text-sm">
      <thead className="bg-white/[0.02] text-left">
        <tr>
          {head.map((cell) => (
            <th
              key={cell}
              className="px-4 py-3 text-[10px] uppercase tracking-[0.25em] text-muted-foreground"
            >
              {cell}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-white/5">
        {rows.map((row, rowIndex) => (
          <tr key={rowIndex} className="hover:bg-white/[0.02]">
            {row.map((cell, cellIndex) => {
              const isLast = cellIndex === row.length - 1;
              return (
                <td
                  key={`${cell}-${cellIndex}`}
                  className={`px-4 py-3 ${
                    isLast
                      ? "text-right text-[10px] uppercase tracking-widest text-accent"
                      : "text-zinc-200"
                  }`}
                >
                  {isLast ? (
                    <button type="button" className="hover:underline">
                      {cell}
                    </button>
                  ) : (
                    cell
                  )}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
