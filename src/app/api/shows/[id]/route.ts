// app/api/shows/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { withStaffSession } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

const UpdateSchema = z.object({
  date:       z.string().datetime().optional(),
  venueName:  z.string().min(1).optional(),
  city:       z.string().min(1).optional(),
  country:    z.string().min(1).optional(),
  ticketUrl:  z.string().url().optional(),
  soldOut:    z.boolean().optional(),
  published:  z.boolean().optional(),
}).strict();

export function PATCH(req: NextRequest, { params }: Params) {
  return withStaffSession(req, ["ADMIN", "EDITOR"], async () => {
    const { id } = await params;
    const body = UpdateSchema.safeParse(await req.json());
    if (!body.success) return NextResponse.json({ error: body.error.flatten() }, { status: 400 });

    const { date, ...rest } = body.data;
    const show = await prisma.show.update({
      where: { id },
      data: { ...rest, ...(date && { date: new Date(date) }) },
    });
    return NextResponse.json(show);
  });
}

export function DELETE(req: NextRequest, { params }: Params) {
  return withStaffSession(req, ["ADMIN"], async () => {
    const { id } = await params;
    await prisma.show.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  });
}
