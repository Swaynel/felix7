// app/api/admin/orders/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { withStaffSession } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

const UpdateSchema = z.object({
  fulfillmentStatus: z.enum(["UNFULFILLED", "SHIPPED", "DELIVERED"]).optional(),
  status:            z.enum(["REFUNDED"]).optional(), // admins may only move to REFUNDED, not back to PAID
}).strict();

// PATCH /api/admin/orders/[id] — update fulfillment or mark refunded
export function PATCH(req: NextRequest, { params }: Params) {
  return withStaffSession(req, ["ADMIN"], async () => {
    const { id } = await params;
    const body = UpdateSchema.safeParse(await req.json());
    if (!body.success) return NextResponse.json({ error: body.error.flatten() }, { status: 400 });

    const { fulfillmentStatus, status } = body.data;

    // If updating fulfillment, apply to PHYSICAL items in this order only
    const order = await prisma.order.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(fulfillmentStatus && {
          items: {
            updateMany: {
              where: { deliveryType: "PHYSICAL" },
              data: { fulfillmentStatus },
            },
          },
        }),
      },
      include: { items: true },
    });

    return NextResponse.json(order);
  });
}
