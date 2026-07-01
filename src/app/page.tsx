import type { Metadata } from "next";
import Link from "next/link";
import { CoverArt } from "@/components/CoverArt";
import { formatShowDate, getProducts, getReleases, getShows } from "@/lib/site-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Vesper Hour out now",
  description:
    "Official site of feli7xrescent. New LP Vesper Hour out now - stream, tour dates, merch, and press.",
};

// Single source of truth for the hero video — swap the ID here to change it everywhere.
const HERO_YOUTUBE_VIDEO_ID = "dQw4w9WgXcQ";
const HERO_YOUTUBE_EMBED_URL = `https://www.youtube-nocookie.com/embed/${HERO_YOUTUBE_VIDEO_ID}?autoplay=1&mute=1&loop=1&playlist=${HERO_YOUTUBE_VIDEO_ID}&controls=0&modestbranding=1&rel=0&disablekb=1`;

export default async function Home() {
  const [releases, shows, products] = await Promise.all([
    getReleases(),
    getShows(),
    getProducts(),
  ]);
  const featured = releases.find((release) => release.featured) ?? releases[0];
  const upcoming = shows.slice(0, 3);
  const featuredMerch = products.slice(0, 3);
  const archive = releases.slice(0, 5);

  return (
    <div className="relative isolate">
      {/* Ambient video underlay — absolutely positioned so it never adds to page height. */}
      <div className="pointer-events-none absolute left-1/2 right-1/2 top-0 -z-10 h-[45vh] w-screen -mx-[50vw] overflow-hidden">
        <iframe
          src={HERO_YOUTUBE_EMBED_URL}
          title="Background video"
          className="h-full w-full scale-125 select-none blur-md"
          tabIndex={-1}
          loading="eager"
          referrerPolicy="strict-origin-when-cross-origin"
          allow="autoplay; encrypted-media"
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      <section className="px-6 pt-32 pb-24">
        <div className="mx-auto flex max-w-7xl flex-col items-center">
          <div className="group relative">
            <CoverArt
              hue={featured.cover.hue}
              label={featured.cover.label}
              className="w-[320px] md:w-[480px]"
            />
            <div className="pointer-events-none absolute -bottom-10 left-1/2 w-[120%] -translate-x-1/2 text-center md:-bottom-14">
              <h1 className="font-display text-7xl leading-none text-accent text-balance drop-shadow-[0_0_30px_rgba(220,38,38,0.45)] md:text-9xl">
                {featured.title}
              </h1>
            </div>
          </div>

          <div className="mt-28 flex flex-col items-center gap-4">
            <p className="text-eyebrow">
              {featured.type} / {featured.year}
            </p>
            <a
              href={featured.streaming.spotify}
              className="group inline-flex items-center gap-3 rounded-full border border-accent/40 py-2 pl-3 pr-5 text-sm uppercase tracking-[0.25em] text-accent transition-all hover:bg-accent hover:text-background"
            >
              <span className="flex size-4 items-center justify-center">
                <span className="size-1.5 animate-pulse rounded-full bg-accent group-hover:bg-background" />
              </span>
              Stream / Download
            </a>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-10 flex items-end justify-between gap-8">
            <h2 className="text-eyebrow">Recent Works</h2>
            <div className="mx-4 h-px flex-1 bg-white/5" />
            <Link
              href="/music"
              className="text-[10px] uppercase tracking-[0.25em] text-accent hover:underline"
            >
              View Discography -&gt;
            </Link>
          </div>
          <div className="no-scrollbar flex gap-6 overflow-x-auto pb-8">
            {archive.map((release) => (
              <Link
                key={release.slug}
                href={`/music/${release.slug}`}
                className="group block min-w-[260px] space-y-3 md:min-w-[300px]"
              >
                <CoverArt hue={release.cover.hue} label={release.cover.label} />
                <div className="flex items-baseline justify-between">
                  <p className="text-[11px] uppercase tracking-[0.2em] transition-colors group-hover:text-accent">
                    {release.title}
                  </p>
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    {release.type} / {release.year}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-white/5 bg-zinc-950/50 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 flex items-baseline justify-between">
            <h2 className="font-display text-5xl text-accent">Live Liturgy</h2>
            <Link
              href="/tour"
              className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground hover:text-accent"
            >
              All dates -&gt;
            </Link>
          </div>
          <div className="divide-y divide-white/5">
            {upcoming.map((show) => {
              const date = formatShowDate(show.date);
              return (
                <div
                  key={`${show.date}-${show.city}`}
                  className="flex items-center justify-between gap-6 py-7 transition-all hover:pl-3"
                >
                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                        {date.month}
                      </div>
                      <div className="font-display text-3xl text-accent">{date.day}</div>
                    </div>
                    <div>
                      <div className="text-lg font-medium tracking-tight">{show.venue}</div>
                      <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
                        {show.city}, {show.country}
                      </div>
                    </div>
                  </div>
                  <a
                    href={show.ticketUrl}
                    className={`shrink-0 rounded-full border px-5 py-2 text-[10px] uppercase tracking-widest transition-colors ${
                      show.status === "sold_out"
                        ? "border-zinc-800 text-muted-foreground"
                        : "border-zinc-800 hover:border-accent hover:text-accent"
                    }`}
                  >
                    {show.status === "sold_out"
                      ? "Sold Out"
                      : show.status === "low"
                        ? "Low Tickets"
                        : "Tickets"}
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 flex items-baseline justify-between">
            <h2 className="font-display text-5xl text-accent">Relics</h2>
            <Link
              href="/shop"
              className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground hover:text-accent"
            >
              Enter shop -&gt;
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {featuredMerch.map((product) => (
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
                <div className="flex items-baseline justify-between">
                  <div>
                    <h3 className="text-sm uppercase tracking-widest">{product.name}</h3>
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                      {product.category}
                    </p>
                  </div>
                  <span className="text-sm text-accent">{product.priceLabel}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}