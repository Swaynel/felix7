// app/api/products/[slug]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { withStaffSession } from "@/lib/auth";
import { deleteAsset } from "@/lib/cloudinary";

type Params = { params: Promise<{ slug: string }> };

// GET /api/products/[slug] — public
export async function GET(_req: NextRequest, { params }: Params) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { variants: true, release: { select: { title: true, slug: true } } },
  });
  if (!product) return new NextResponse("Not found", { status: 404 });
  return NextResponse.json(product);
}

const UpdateSchema = z.object({
  title:          z.string().min(1).optional(),
  description:    z.string().optional(),
  priceMinor:     z.number().int().positive().optional(),
  active:         z.boolean().optional(),
  imagePublicIds: z.array(z.string()).optional(),
}).strict();

// PATCH /api/products/[slug] — admin/editor
export function PATCH(req: NextRequest, { params }: Params) {
  return withStaffSession(req, ["ADMIN", "EDITOR"], async () => {
    const { slug } = await params;
    const body = UpdateSchema.safeParse(await req.json());
    if (!body.success) return NextResponse.json({ error: body.error.flatten() }, { status: 400 });

    const { imagePublicIds, ...rest } = body.data;
    const product = await prisma.product.update({
      where: { slug },
      data: { ...rest, ...(imagePublicIds && { imageKeys: imagePublicIds }) },
    });
    return NextResponse.json(product);
  });
}

// DELETE /api/products/[slug] — admin only
export function DELETE(req: NextRequest, { params }: Params) {
  return withStaffSession(req, ["ADMIN"], async () => {
    const { slug } = await params;
    const product = await prisma.product.findUnique({
      where: { slug },
      include: { variants: true },
    });
    if (!product) return new NextResponse("Not found", { status: 404 });

    await Promise.allSettled([
      ...product.imageKeys.map((k) => deleteAsset(k, "image")),
      ...product.variants
        .filter((v) => v.digitalFileKey)
        .map((v) => deleteAsset(v.digitalFileKey!, "video")),
    ]);

    await prisma.product.delete({ where: { slug } });
    return new NextResponse(null, { status: 204 });
  });
}
