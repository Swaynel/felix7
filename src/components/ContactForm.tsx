"use client";

import { useState, type FormEvent } from "react";

type Intent = "booking" | "press" | "general";

const INTENTS: { id: Intent; label: string; sub: string }[] = [
  { id: "booking", label: "Booking", sub: "Promoters, agents, festivals" },
  { id: "press", label: "Press", sub: "Interviews, premieres, reviews" },
  { id: "general", label: "General / Fan Mail", sub: "Everything else" },
];

export function ContactForm() {
  const [intent, setIntent] = useState<Intent>("booking");
  const [sent, setSent] = useState(false);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSent(true);
  }

  return (
    <section className="px-6 pt-32 pb-24">
      <div className="mx-auto max-w-4xl">
        <header className="mb-12 border-b border-white/5 pb-6">
          <p className="text-eyebrow">Inquiries</p>
          <h1 className="mt-3 font-display text-7xl text-accent md:text-8xl">Contact</h1>
        </header>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {INTENTS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setIntent(item.id);
                setSent(false);
              }}
              className={`rounded-md border p-5 text-left transition-colors ${
                intent === item.id ? "border-accent bg-accent/5" : "border-white/5 hover:border-white/20"
              }`}
            >
              <div
                className={`font-display text-2xl ${
                  intent === item.id ? "text-accent" : "text-zinc-200"
                }`}
              >
                {item.label}
              </div>
              <div className="mt-1 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                {item.sub}
              </div>
            </button>
          ))}
        </div>

        {sent ? (
          <div className="mt-12 rounded-md border border-accent/40 bg-accent/5 p-8 text-center">
            <h2 className="font-display text-4xl text-accent">Received</h2>
            <p className="mt-3 text-sm text-zinc-300">
              Your message has been routed to the {intent} inbox. Expect a reply within 5
              business days.
            </p>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-12 space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Field label="Name" name="name" required />
              <Field label="Email" name="email" type="email" required />
            </div>

            {intent === "booking" && (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Field label="Company / Venue" name="company" required />
                <Field label="Proposed Date" name="date" type="date" />
              </div>
            )}
            {intent === "press" && <Field label="Outlet" name="outlet" required />}

            <div>
              <label className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                Message
              </label>
              <textarea
                name="message"
                rows={6}
                required
                className="mt-2 w-full resize-none rounded-md border border-white/10 bg-surface/40 p-4 text-sm text-zinc-100 outline-none focus:border-accent"
              />
            </div>

            <div className="flex flex-col gap-4 pt-2 md:flex-row md:items-center md:justify-between">
              <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                Routes to: {intent}@feli7x.com
              </p>
              <button
                type="submit"
                className="rounded-full bg-accent px-10 py-3 text-[11px] uppercase tracking-[0.3em] text-background transition-colors hover:bg-accent/80"
              >
                Send
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
        {label}
      </label>
      <input
        type={type}
        name={name}
        required={required}
        className="mt-2 w-full rounded-md border border-white/10 bg-surface/40 p-3 text-sm text-zinc-100 outline-none focus:border-accent"
      />
    </div>
  );
}
