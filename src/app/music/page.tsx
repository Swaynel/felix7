import type { Metadata } from "next";
import Link from "next/link";
import { CoverArt } from "@/components/CoverArt";
import { releases } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "Music",
  description:
    "Full discography of feli7xrescent - LPs, EPs, and singles. Stream on Spotify, Apple Music, and Bandcamp.",
};

export default function MusicPage() {
  return (
    <section className="px-6 pt-32 pb-24">
      <div className="mx-auto max-w-7xl">
        <header className="mb-16 flex items-end justify-between border-b border-white/5 pb-6">
          <h1 className="font-display text-7xl text-accent md:text-8xl">Discography</h1>
          <p className="text-eyebrow">{releases.length} releases</p>
        </header>

        <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {releases.map((release) => (
            <Link
              key={release.slug}
              href={`/music/${release.slug}`}
              className="group block space-y-4"
            >
              <CoverArt
                hue={release.cover.hue}
                label={release.cover.label}
                className="transition-transform group-hover:-translate-y-1"
              />
              <div>
                <div className="flex items-baseline justify-between">
                  <h2 className="font-display text-3xl text-accent group-hover:underline">
                    {release.title}
                  </h2>
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    {release.year}
                  </span>
                </div>
                <p className="mt-1 text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
                  {release.type} / {release.tracks.length} track
                  {release.tracks.length === 1 ? "" : "s"}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
