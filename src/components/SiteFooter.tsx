import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/5 py-16">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="font-display text-5xl text-accent leading-none">feli7xrescent</div>
          <p className="mt-4 max-w-sm text-sm text-muted-foreground">
            Industrial liturgy and crimson static. New LP &quot;Vesper Hour&quot; out now.
          </p>
        </div>

        <div className="space-y-4">
          <p className="text-eyebrow">Inquiries</p>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/contact" className="hover:text-accent transition-colors">
                Booking
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-accent transition-colors">
                Fan Mail
              </Link>
            </li>
            <li>
              <Link href="/epk" className="hover:text-accent transition-colors">
                Press Kit
              </Link>
            </li>
          </ul>
        </div>

        <div className="space-y-4">
          <p className="text-eyebrow">Connect</p>
          <ul className="space-y-2 text-sm">
            <li>
            <Link
  href={`https://www.instagram.com/feli7xrescent/`}
  className="hover:text-accent transition-colors">
  Instagram
</Link>
            </li>
            <li>
            <Link
  href={`https://www.instagram.com/feli7xrescent/`}
  className="hover:text-accent transition-colors">
                Spotify
              </Link>
            </li>
            <li>
              <Link
  href={`https://www.bandcamp.com/feli7xrescent`}
  className="hover:text-accent transition-colors">
                Bandcamp
              </Link>
            </li>
            <li>
              <Link
  href={`https://www.youtube.com/feli7xrescent`}
  className="hover:text-accent transition-colors">
                YouTube
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-16 flex max-w-7xl flex-col items-center justify-between gap-4 border-t border-white/5 px-6 pt-8 text-[10px] uppercase tracking-[0.3em] text-muted-foreground md:flex-row">
        <span>&copy; 2026 feli7xrescent / artery records</span>
        <span>All rites reserved</span>
      </div>
    </footer>
  );
}
