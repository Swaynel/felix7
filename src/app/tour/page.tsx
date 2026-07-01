import type { Metadata } from "next";
import { formatShowDate, getShows } from "@/lib/site-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tour",
  description:
    "feli7xrescent tour dates. Europe and North America, autumn 2026. Tickets and venue details.",
};

export default async function TourPage() {
  const shows = await getShows();

  return (
    <section className="px-6 pt-32 pb-24">
      <div className="mx-auto max-w-5xl">
        <header className="mb-12 flex items-end justify-between border-b border-white/5 pb-6">
          <h1 className="font-display text-7xl text-accent md:text-8xl">Tour</h1>
          <p className="text-eyebrow">Autumn 2026</p>
        </header>

        <div className="divide-y divide-white/5">
          {shows.map((show) => {
            const date = formatShowDate(show.date);
            return (
              <div
                key={`${show.date}-${show.city}`}
                className="grid grid-cols-[auto_1fr_auto] items-center gap-8 py-8 transition-colors hover:bg-white/[0.02] hover:pl-4"
              >
                <div className="text-right">
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    {date.month}
                  </div>
                  <div className="font-display text-5xl text-accent">{date.day}</div>
                </div>
                <div>
                  <div className="text-2xl font-medium tracking-tight">{show.venue}</div>
                  <div className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
                    {show.city}, {show.country}
                  </div>
                </div>
                {show.status === "sold_out" ? (
                  <span className="rounded-full border border-zinc-800 px-6 py-2 text-[10px] uppercase tracking-widest text-muted-foreground">
                    Sold Out
                  </span>
                ) : (
                  <a
                    href={show.ticketUrl && show.ticketUrl !== "#" ? show.ticketUrl : "/contact"}
                    target={show.ticketUrl && show.ticketUrl !== "#" ? "_blank" : undefined}
                    rel={show.ticketUrl && show.ticketUrl !== "#" ? "noopener noreferrer" : undefined}
                    className="rounded-full border border-zinc-800 px-6 py-2 text-[10px] uppercase tracking-widest transition-colors hover:border-accent hover:text-accent"
                  >
                    {show.status === "low" ? "Low Tickets" : "Tickets"}
                  </a>
                )}
              </div>
            );
          })}
        </div>

        <p className="mt-16 text-center text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          For booking inquiries - see Contact
        </p>
      </div>
    </section>
  );
}
