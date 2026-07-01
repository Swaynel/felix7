// app/api/orders/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withCustomerSession } from "@/lib/auth";

// GET /api/orders — returns the authenticated customer's orders
export function GET(req: NextRequest) {
  return withCustomerSession(req, async (session) => {
    const orders = await prisma.order.findMany({
      where: { customerId: session.customerId },
      include: {
        items: {
          include: {
            variant: {
              include: { product: { select: { title: true, deliveryType: true } } },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(orders);
  });
}
