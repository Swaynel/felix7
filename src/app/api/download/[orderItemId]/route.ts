// app/api/download/[orderItemId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withCustomerSession } from "@/lib/auth";
import { getSignedDeliveryUrl } from "@/lib/cloudinary";

type Params = { params: Promise<{ orderItemId: string }> };

export function GET(req: NextRequest, { params }: Params) {
  return withCustomerSession(req, async (session) => {
    const { orderItemId } = await params;
    const orderItem = await prisma.orderItem.findUnique({
      where: { id: orderItemId },
      include: {
        order:   { select: { customerId: true, status: true } },
        variant: { select: { digitalFileKey: true } },
      },
    });

    // All three failure cases return 404 — don't leak which check failed
    if (!orderItem)                                                return new NextResponse("Not found", { status: 404 });
    if (orderItem.order.customerId !== session.customerId)         return new NextResponse("Not found", { status: 404 });
    if (orderItem.order.status !== "PAID")                        return NextResponse.json({ error: "order not paid" }, { status: 403 });
    if (orderItem.deliveryType !== "DIGITAL")                     return NextResponse.json({ error: "not a digital item" }, { status: 400 });
    if (!orderItem.variant.digitalFileKey)                        return NextResponse.json({ error: "no file on record" }, { status: 500 });

    // Determine resource type from the public_id's folder convention
    // (tracks are in musician/tracks — Cloudinary video type for audio)
    const isAudio = orderItem.variant.digitalFileKey.includes("musician/tracks");
    const resourceType = isAudio ? "video" : "raw";

    const url = getSignedDeliveryUrl(orderItem.variant.digitalFileKey, resourceType, 300);

    await prisma.orderItem.update({
      where: { id: orderItem.id },
      data:  { downloadCount: { increment: 1 } },
    });

    return NextResponse.json({ url, expiresInSeconds: 300 });
  });
}
