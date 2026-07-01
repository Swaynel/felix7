import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { withStaffSession } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

const UpdateSchema = z.object({
  handled: z.boolean(),
});

export function PATCH(req: NextRequest, { params }: Params) {
  return withStaffSession(req, ["ADMIN", "EDITOR"], async () => {
    const { id } = await params;
    const body = UpdateSchema.safeParse(await req.json());
    if (!body.success) return NextResponse.json({ error: body.error.flatten() }, { status: 400 });

    const inquiry = await prisma.inquiry.findUnique({ where: { id } });
    if (!inquiry) return new NextResponse("Not found", { status: 404 });

    const updated = await prisma.inquiry.update({
      where: { id },
      data: { handled: body.data.handled },
    });

    return NextResponse.json(updated);
  });
}
