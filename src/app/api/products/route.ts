import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { withStaffSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const onlyActive = searchParams.get("active") !== "false";

  const products = await prisma.product.findMany({
    where: onlyActive ? { active: true } : {},
    include: { variants: true, release: { select: { title: true, slug: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(products);
}

const ProductSchema = z.object({
  title:        z.string().min(1),
  slug:         z.string().min(1).regex(/^[a-z0-9-]+$/),
  description:  z.string().optional(),
  releaseId:    z.string().optional(),
  deliveryType: z.enum(["DIGITAL", "PHYSICAL"]),
  priceMinor:   z.number().int().positive(), // smallest currency unit (kobo for NGN)
  currency:     z.string().length(3).default("NGN"),
  imagePublicIds: z.array(z.string()),       // Cloudinary public_ids
  variants: z.array(z.object({
    label:           z.string().min(1),
    sku:             z.string().min(1),
    stock:           z.number().int().optional(),   // null for digital (unlimited)
    digitalPublicId: z.string().optional(),         // Cloudinary public_id for the file
  })).min(1),
});

export function POST(req: NextRequest) {
  return withStaffSession(req, ["ADMIN", "EDITOR"], async () => {
    const body = ProductSchema.safeParse(await req.json());
    if (!body.success) return NextResponse.json({ error: body.error.flatten() }, { status: 400 });

    const { variants, imagePublicIds, ...productData } = body.data;

    // Enforce: DIGITAL products must not have stock; PHYSICAL must.
    if (productData.deliveryType === "DIGITAL") {
      if (variants.some((v) => v.stock !== undefined && v.stock !== null)) {
        return NextResponse.json(
          { error: "Digital variants must not specify stock (unlimited by nature)" },
          { status: 400 }
        );
      }
    }

    const product = await prisma.product.create({
      data: {
        ...productData,
        imageKeys: imagePublicIds,
        variants: {
          create: variants.map((v) => ({
            label:         v.label,
            sku:           v.sku,
            stock:         v.stock ?? null,
            digitalFileKey: v.digitalPublicId,
          })),
        },
      },
      include: { variants: true },
    });

    return NextResponse.json(product, { status: 201 });
  });
}
