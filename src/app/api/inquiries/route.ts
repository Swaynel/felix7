// app/api/inquiries/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { withStaffSession } from "@/lib/auth";

// POST /api/inquiries — public (contact/booking form submission)
const InquirySchema = z.discriminatedUnion("type", [
  z.object({
    type:    z.literal("BOOKING"),
    name:    z.string().min(1),
    email:   z.string().email(),
    message: z.string().min(10),
    metadata: z.object({
      venue:     z.string().optional(),
      eventDate: z.string().optional(),
      budget:    z.string().optional(),
    }).optional(),
  }),
  z.object({
    type:    z.literal("FAN"),
    name:    z.string().min(1),
    email:   z.string().email(),
    message: z.string().min(1),
    metadata: z.undefined().optional(),
  }),
  z.object({
    type:    z.literal("PRESS"),
    name:    z.string().min(1),
    email:   z.string().email(),
    message: z.string().min(1),
    metadata: z.object({
      publication: z.string().optional(),
    }).optional(),
  }),
]);

export async function POST(req: NextRequest) {
  const body = InquirySchema.safeParse(await req.json());
  if (!body.success) return NextResponse.json({ error: body.error.flatten() }, { status: 400 });

  const inquiry = await prisma.inquiry.create({ data: body.data });
  return NextResponse.json({ id: inquiry.id }, { status: 201 });
}

// GET /api/inquiries — admin only (view all, filter by type/handled)
export function GET(req: NextRequest) {
  return withStaffSession(req, ["ADMIN", "EDITOR"], async () => {
    const { searchParams } = new URL(req.url);
    const type    = searchParams.get("type") as "BOOKING" | "FAN" | "PRESS" | null;
    const handled = searchParams.get("handled");

    const inquiries = await prisma.inquiry.findMany({
      where: {
        ...(type && { type }),
        ...(handled !== null && { handled: handled === "true" }),
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(inquiries);
  });
}
