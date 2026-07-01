import { notFound } from "next/navigation";
import Link from "next/link";
import { press, type PressItem } from "@/lib/mock-data";

type Props = {
  params: { slug: string };
};

export async function generateMetadata({ params }: Props) {
  const item = press.find((p) => p.slug === params.slug);

  if (!item) {
    return {
      title: "Press — feli7xrescent",
    };
  }

  return {
    title: `${item.title} — feli7xrescent`,
    description: item.excerpt,
  };
}

export default function PressDetailPage({ params }: Props) {
  const item = press.find((p) => p.slug === params.slug);

  if (!item) return notFound();

  return (
    <section className="px-6 pt-32 pb-24">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/press"
          className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground hover:text-accent"
        >
          ← Press
        </Link>

        <header className="mt-6 border-b border-white/5 pb-8">
          <p className="text-eyebrow">
            {item.source} · {item.type} ·{" "}
            {new Date(item.date).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </p>

          <h1 className="mt-4 font-display text-6xl text-accent leading-[0.95]">
            {item.title}
          </h1>
        </header>

        <article className="mt-10 space-y-6 text-lg leading-relaxed text-zinc-300">
          <p className="text-2xl text-zinc-200">{item.excerpt}</p>
          <p>
            Full coverage is archived with the original publisher. Reach out via
            the press contact on the EPK for high-resolution assets, quotes, and
            interview requests related to this piece.
          </p>
        </article>

        <div className="mt-12 flex flex-wrap gap-3">
          <Link
            href="/epk"
            className="rounded-full border border-white/10 px-5 py-2 text-[10px] uppercase tracking-widest hover:border-accent hover:text-accent transition-colors"
          >
            Press Kit
          </Link>

          <Link
            href="/contact"
            className="rounded-full border border-white/10 px-5 py-2 text-[10px] uppercase tracking-widest hover:border-accent hover:text-accent transition-colors"
          >
            Contact
          </Link>
        </div>
      </div>
    </section>
  );
}