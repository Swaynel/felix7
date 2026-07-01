import type { Metadata } from "next";
import { press } from "@/lib/mock-data";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Press & News",
  description: "Latest news, press mentions, and dispatches from feli7xrescent.",
};

export default function PressPage() {
  const news = press.filter((item) => item.type === "news");
  const mentions = press.filter((item) => item.type !== "news");

  return (
    <section className="px-6 pt-32 pb-24">
      <div className="mx-auto max-w-5xl">
        <header className="mb-16 border-b border-white/5 pb-6">
          <p className="text-eyebrow">Dispatches & coverage</p>
          <h1 className="mt-3 font-display text-7xl text-accent md:text-8xl">Press</h1>
        </header>

        <div className="mb-20">
          <h2 className="text-eyebrow mb-8">Latest</h2>
          <div className="space-y-10">
            {news.map((item) => (
              <article
                key={item.slug}
                className="grid grid-cols-1 gap-4 border-b border-white/5 pb-10 md:grid-cols-[140px_1fr]"
              >
                <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground md:pt-2">
                  {new Date(item.date).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </div>
                <div>
                  <h3 className="font-display text-3xl text-accent">{item.title}</h3>
                  <p className="mt-3 text-base leading-relaxed text-zinc-300">{item.excerpt}</p>
                 <Link
  href={`/press/${item.slug}`}
  className="mt-4 inline-block text-[10px] uppercase tracking-[0.25em] text-accent hover:underline"
>
  Read full -&gt;
</Link>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-eyebrow mb-8">Press Mentions</h2>
          <div className="space-y-1">
            {mentions.map((item) => (
              <a
                key={item.slug}
                href={item.url}
                className="group flex items-baseline justify-between gap-6 border-t border-white/5 py-6 transition-colors hover:bg-white/[0.02] hover:pl-4"
              >
                <div>
                  <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                    {item.source} / {item.type}
                  </div>
                  <div className="mt-1 font-display text-2xl text-accent group-hover:underline">
                    &quot;{item.title}&quot;
                  </div>
                  <p className="mt-2 max-w-2xl text-sm text-zinc-400">{item.excerpt}</p>
                </div>
                <span className="shrink-0 text-[10px] uppercase tracking-widest text-muted-foreground">
                  {new Date(item.date).getFullYear()}
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
