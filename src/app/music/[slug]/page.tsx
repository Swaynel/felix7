import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CoverArt } from "@/components/CoverArt";
import { releases } from "@/lib/mock-data";

type ReleasePageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return releases.map((release) => ({ slug: release.slug }));
}

export async function generateMetadata({ params }: ReleasePageProps): Promise<Metadata> {
  const { slug } = await params;
  const release = releases.find((item) => item.slug === slug);

  if (!release) {
    return {
      title: "Release not found",
    };
  }

  return {
    title: release.title,
    description: release.blurb,
    openGraph: {
      title: `${release.title} - feli7xrescent`,
      description: release.blurb,
    },
  };
}

export default async function ReleasePage({ params }: ReleasePageProps) {
  const { slug } = await params;
  const release = releases.find((item) => item.slug === slug);

  if (!release) {
    notFound();
  }

  return (
    <section className="px-6 pt-32 pb-24">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/music"
          className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground hover:text-accent"
        >
          &larr; Discography
        </Link>

        <div className="mt-10 grid grid-cols-1 gap-12 md:grid-cols-[400px_1fr]">
          <CoverArt hue={release.cover.hue} label={release.cover.label} />

          <div>
            <p className="text-eyebrow">
              {release.type} / {release.year}
            </p>
            <h1 className="mt-2 font-display text-7xl leading-none text-accent md:text-8xl">
              {release.title}
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-zinc-300">
              {release.blurb}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={release.streaming.spotify}
                className="rounded-full bg-accent px-6 py-2 text-[11px] uppercase tracking-[0.25em] text-background transition-colors hover:bg-accent/80"
              >
                Spotify
              </a>
              <a
                href={release.streaming.apple}
                className="rounded-full border border-white/10 px-6 py-2 text-[11px] uppercase tracking-[0.25em] transition-colors hover:border-accent hover:text-accent"
              >
                Apple Music
              </a>
              <a
                href={release.streaming.bandcamp}
                className="rounded-full border border-white/10 px-6 py-2 text-[11px] uppercase tracking-[0.25em] transition-colors hover:border-accent hover:text-accent"
              >
                Bandcamp
              </a>
            </div>
          </div>
        </div>

        <div className="mt-16">
          <h2 className="text-eyebrow mb-6">Tracklist</h2>
          <div className="divide-y divide-white/5 border-t border-white/5">
            {release.tracks.map((track) => (
              <div
                key={track.no}
                className="group flex items-center gap-6 py-5 transition-colors hover:bg-white/[0.02]"
              >
                <button
                  type="button"
                  aria-label={`Play preview for ${track.title}`}
                  className="flex size-9 items-center justify-center rounded-full border border-white/10 text-accent transition-colors hover:border-accent hover:bg-accent hover:text-background"
                >
                  <svg viewBox="0 0 12 12" className="size-3" fill="currentColor" aria-hidden>
                    <path d="M2 1l9 5-9 5z" />
                  </svg>
                </button>
                <span className="w-8 font-display text-2xl text-muted-foreground group-hover:text-accent">
                  {String(track.no).padStart(2, "0")}
                </span>
                <span className="flex-1 text-base">{track.title}</span>
                <span className="text-[11px] uppercase tracking-widest text-muted-foreground">
                  {track.length}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-6 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            Previews stream from object storage when the backend is enabled.
          </p>
        </div>
      </div>
    </section>
  );
}
