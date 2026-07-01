import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 pt-24">
      <div className="max-w-md text-center">
        <div className="font-display text-[10rem] leading-none text-accent">404</div>
        <h2 className="mt-2 text-xl font-semibold tracking-tight">Lost in the procession</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          That page is not on this record. Head back to the home page.
        </p>
        <div className="mt-8">
          <Link
            href="/"
            className="inline-flex items-center rounded-full border border-accent/40 px-6 py-2 text-[11px] uppercase tracking-[0.3em] text-accent transition-colors hover:bg-accent hover:text-background"
          >
            Return home
          </Link>
        </div>
      </div>
    </div>
  );
}
