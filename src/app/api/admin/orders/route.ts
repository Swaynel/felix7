// app/api/admin/orders/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withStaffSession } from "@/lib/auth";

// GET /api/admin/orders — all orders, paginated, filterable by status
export function GET(req: NextRequest) {
  return withStaffSession(req, ["ADMIN", "EDITOR"], async () => {
    const { searchParams } = new URL(req.url);
    const status  = searchParams.get("status") as "PENDING" | "PAID" | "FAILED" | "REFUNDED" | null;
    const page    = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const perPage = 50;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: status ? { status } : {},
        include: {
          items: {
            include: {
              variant: { include: { product: { select: { title: true } } } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      prisma.order.count({ where: status ? { status } : {} }),
    ]);

    return NextResponse.json({ orders, total, page, perPage });
  });
}
