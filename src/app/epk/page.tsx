import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "EPK",
  description:
    "Electronic Press Kit for feli7xrescent. Bio, hi-res press photos, stage plot, tech rider, and video.",
};

export default function EpkPage() {
  return (
    <section className="px-6 pt-32 pb-24">
      <div className="mx-auto max-w-5xl">
        <header className="mb-12 border-b border-white/5 pb-6">
          <p className="text-eyebrow">For bookers, promoters, press</p>
          <h1 className="mt-3 font-display text-7xl text-accent md:text-8xl">EPK</h1>
        </header>

          <h2 className="text-eyebrow">Artist Biography</h2>
          <div className="space-y-4 text-base leading-relaxed text-zinc-300">
            <p>
              feli7xrescent is the recording project of an anonymous composer working between
              Lille and Berlin. Operating somewhere between industrial liturgy and slow-burn
              electronics, the project&apos;s records read as architectural drawings of grief: long
              halls of low-end, sudden crimson interventions, and field recordings drawn from
              deconsecrated chapels.
            </p>
            <p>
              The debut LP &quot;Vesper Hour&quot; (2024) was self-released through Artery Records, an
              imprint operated by the artist. It was preceded by the Fracture EP (2023) and the
              singles &quot;Crimson Tide&quot; (2023) and &quot;Aethelred&quot; (2022).
            </p>
            <p>
              feli7xrescent has performed at Berghain Kantine, Le Trianon, and Electric Ballroom,
              with a Boiler Room set scheduled for the upcoming European tour.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 pt-2">
            <a
             href="mailto:mgmt@feli7x.com?subject=Short%20bio%20request"
              className="rounded-full border border-white/10 px-5 py-2 text-[10px] uppercase tracking-widest transition-colors hover:border-accent hover:text-accent"
            >
              Short bio (.txt)
            </a>
            <a
              href="mailto:mgmt@feli7x.com?subject=Long%20bio%20request"
              className="rounded-full border border-white/10 px-5 py-2 text-[10px] uppercase tracking-widest transition-colors hover:border-accent hover:text-accent"
            >
              Long bio (.pdf)
            </a>
          </div>

        <div className="mt-20 space-y-6">
          <div className="flex items-end justify-between">
            <h2 className="text-eyebrow">Press Photos - Hi-Res</h2>
            <a
               href="mailto:mgmt@feli7x.com?subject=Press%20photos%20(hi-res%20zip)"
              className="text-[10px] uppercase tracking-[0.25em] text-accent hover:underline"
            >
              Request all (.zip)
            </a>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {[0, 350, 5, 358, 12, 0].map((hue, index) => (
              <a
                key={`${hue}-${index}`}
                href="mailto:mgmt@feli7x.com?subject=Press%20photos%20(hi-res%20zip)"
                className="group relative block aspect-[4/5] overflow-hidden rounded-md outline-1 -outline-offset-1 outline-white/5"
                style={{
                  background: `radial-gradient(120% 80% at 30% 20%, hsl(${hue} 70% 28% / 0.95), hsl(${hue} 80% 10%), #09090b)`,
                }}
              >
                <div className="absolute inset-0 flex items-end justify-between p-3 text-[9px] uppercase tracking-widest text-white/60 opacity-0 transition-opacity group-hover:opacity-100">
                  <span>Photo {String(index + 1).padStart(2, "0")}</span>
                  <span>4000x5000</span>
                </div>
              </a>
            ))}
          </div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            Credit: photographer name, required when published.
          </p>
        </div>

        <div className="mt-20 grid grid-cols-1 gap-6 md:grid-cols-2">
          <DownloadCard
            title="Stage Plot"
            sub="A4 PDF / v2.3"
            note="Channel list, monitor layout, FOH placement"
          />
          <DownloadCard
            title="Tech Rider"
            sub="A4 PDF / v2.3"
            note="Backline, hospitality, advance contact"
          />
        </div>

        <div className="mt-20 space-y-6">
          <h2 className="text-eyebrow">Live Video</h2>
          <div className="relative aspect-video w-full overflow-hidden rounded-md bg-surface outline-1 -outline-offset-1 outline-white/5">
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(120% 80% at 30% 30%, hsl(0 70% 25% / 0.9), hsl(0 80% 10%), #09090b)",
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <button
                type="button"
                aria-label="Play live video"
                className="flex size-20 items-center justify-center rounded-full border border-accent/40 text-accent backdrop-blur transition-all hover:bg-accent hover:text-background"
              >
                <svg viewBox="0 0 12 12" className="size-5" fill="currentColor" aria-hidden>
                  <path d="M2 1l9 5-9 5z" />
                </svg>
              </button>
            </div>
            <div className="absolute bottom-4 left-4 text-[10px] uppercase tracking-[0.3em] text-white/70">
              Vesper Hour - Live at Le Trianon
            </div>
          </div>
        </div>

        <div className="mt-20 rounded-md border border-white/5 bg-surface/40 p-8">
          <h2 className="text-eyebrow mb-4">Booking Contact</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                Worldwide
              </p>
              <p className="mt-1 font-display text-3xl text-accent">mgmt@feli7x.com</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                North America
              </p>
              <p className="mt-1 font-display text-3xl text-accent">na@feli7x.com</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function DownloadCard({ title, sub, note }: { title: string; sub: string; note: string }) {
  return (
    <a
       href={`mailto:mgmt@feli7x.com?subject=${encodeURIComponent(title + " request")}`}
      className="group flex items-center justify-between gap-6 rounded-md border border-white/5 bg-surface/40 p-6 transition-colors hover:border-accent/40"
    >
      <div>
        <div className="font-display text-3xl text-accent">{title}</div>
        <div className="mt-1 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
          {sub}
        </div>
        <div className="mt-3 text-sm text-zinc-300">{note}</div>
      </div>
      <div className="text-2xl text-accent/60 group-hover:text-accent" aria-hidden>
        &darr;
      </div>
    </a>
  );
}
