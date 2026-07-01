// app/api/orders/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withCustomerSession } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

// GET /api/orders/[id] — customer-owned order detail
export function GET(req: NextRequest, { params }: Params) {
  return withCustomerSession(req, async (session) => {
    const { id } = await params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            variant: {
              include: { product: { select: { title: true, deliveryType: true, imageKeys: true } } },
            },
          },
        },
      },
    });

    if (!order) return new NextResponse("Not found", { status: 404 });
    // Ownership: return 404 rather than 403 to avoid confirming the order exists
    if (order.customerId !== session.customerId) {
      return new NextResponse("Not found", { status: 404 });
    }

    return NextResponse.json(order);
  });
}
