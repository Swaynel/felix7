import Link from "next/link";

type OrderConfirmationProps = {
  searchParams: Promise<{ ref?: string }>;
};

export default async function OrderConfirmationPage({ searchParams }: OrderConfirmationProps) {
  const { ref } = await searchParams;

  return (
    <section className="px-6 pt-32 pb-24">
      <div className="mx-auto max-w-3xl border-y border-white/5 py-16 text-center">
        <p className="text-eyebrow">Payment Received</p>
        <h1 className="mt-4 font-display text-6xl text-accent md:text-7xl">
          Order processing
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-zinc-300">
          Paystack has sent the payment back to the studio. The webhook will mark the order paid
          after server verification.
        </p>
        {ref && (
          <p className="mt-6 font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Reference: {ref}
          </p>
        )}
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link
            href="/shop"
            className="rounded-full border border-white/10 px-6 py-2 text-[10px] uppercase tracking-widest transition-colors hover:border-accent hover:text-accent"
          >
            Back to shop
          </Link>
          <Link
            href="/contact"
            className="rounded-full bg-accent px-6 py-2 text-[10px] uppercase tracking-widest text-background transition-colors hover:bg-accent/80"
          >
            Contact support
          </Link>
        </div>
      </div>
    </section>
  );
}
