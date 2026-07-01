import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPaystackSignature, verifyPaystackTransaction } from "@/lib/paystack";

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-paystack-signature");

  if (!verifyPaystackSignature(rawBody, signature)) {
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(rawBody);

  if (event.event !== "charge.success") {
    // Acknowledge other event types without processing — return 200 so
    // Paystack doesn't keep retrying events you don't care about.
    return NextResponse.json({ received: true });
  }

  const reference: string = event.data.reference;

  // Independent server-to-server check — do not trust the webhook body's
  // amount/status fields alone.
  const verification = await verifyPaystackTransaction(reference);
  if (!verification.status || verification.data.status !== "success") {
    return NextResponse.json({ error: "verification failed" }, { status: 400 });
  }

  const order = await prisma.order.findUnique({
    where: { paystackReference: reference },
    include: { items: true },
  });

  if (!order) {
    // Reference doesn't match any order we created — log and reject.
    // This should not happen in normal operation; investigate if it does.
    return NextResponse.json({ error: "order not found" }, { status: 404 });
  }

  // Idempotency guard: if we've already marked this PAID, do nothing further.
  if (order.status === "PAID") {
    return NextResponse.json({ received: true, alreadyProcessed: true });
  }

  // Defense in depth: confirm the verified amount matches what we expect.
  if (verification.data.amount !== order.totalMinor) {
    return NextResponse.json({ error: "amount mismatch" }, { status: 400 });
  }

  await prisma.order.update({
    where: { id: order.id },
    data: {
      status: "PAID",
      items: {
        updateMany: {
          where: { deliveryType: "PHYSICAL" },
          data: { fulfillmentStatus: "UNFULFILLED" },
        },
      },
    },
  });

  // Digital items need no further action here — they are delivered
  // on-demand via /api/download, gated on Order.status === "PAID".
  // Do not pre-generate or email download links from this handler;
  // keep delivery pull-based through the signed-URL endpoint.

  return NextResponse.json({ received: true });
}