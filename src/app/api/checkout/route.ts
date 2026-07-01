// app/api/checkout/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { initializePaystackTransaction } from "@/lib/paystack";
import type { DeliveryType, FulfillmentStatus } from "@/generated/prisma/client";

const CheckoutSchema = z.object({
  email:   z.string().email(),
  items:   z.array(z.object({
    variantId: z.string(),
    quantity:  z.number().int().positive(),
  })).min(1),
  shippingAddress: z.object({
    line1:    z.string(),
    city:     z.string(),
    country:  z.string(),
    postcode: z.string().optional(),
  }).optional(),
});

export async function POST(req: NextRequest) {
  if (!process.env.PAYSTACK_SECRET_KEY) {
    return NextResponse.json({ error: "Paystack is not configured" }, { status: 503 });
  }

  const body = CheckoutSchema.safeParse(await req.json());
  if (!body.success) {
    return NextResponse.json({ error: body.error.flatten() }, { status: 400 });
  }
  const { email, items, shippingAddress } = body.data;

  // Prices are NEVER trusted from the client. Recompute from DB.
  const variantIds = items.map((i) => i.variantId);
  const variants = await prisma.variant.findMany({
    where: { id: { in: variantIds }, product: { active: true } },
    include: { product: true },
  });

  if (variants.length !== items.length) {
    return NextResponse.json({ error: "one or more items not found or inactive" }, { status: 400 });
  }

  let totalMinor   = 0;
  let needsShipping = false;
  const orderItemsData: {
    variantId: string;
    quantity: number;
    unitPriceMinor: number;
    deliveryType: DeliveryType;
    fulfillmentStatus: FulfillmentStatus;
  }[] = [];

  for (const reqItem of items) {
    const variant = variants.find((v) => v.id === reqItem.variantId)!;

    if (variant.product.deliveryType === "PHYSICAL") {
      needsShipping = true;
      if (variant.stock !== null && variant.stock < reqItem.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock: ${variant.label}` },
          { status: 400 }
        );
      }
    }

    totalMinor += variant.product.priceMinor * reqItem.quantity;
    orderItemsData.push({
      variantId:     variant.id,
      quantity:      reqItem.quantity,
      unitPriceMinor: variant.product.priceMinor,
      deliveryType:  variant.product.deliveryType,
      fulfillmentStatus: variant.product.deliveryType === "DIGITAL"
        ? "NOT_APPLICABLE"
        : "UNFULFILLED",
    });
  }

  if (needsShipping && !shippingAddress) {
    return NextResponse.json(
      { error: "shipping address required for physical items" },
      { status: 400 }
    );
  }

  const reference = `ord_${crypto.randomUUID().replace(/-/g, "")}`;

  // Optionally link to a Customer account if one exists for this email
  const customer = await prisma.customer.findUnique({ where: { email } });

  const order = await prisma.order.create({
    data: {
      customerId:        customer?.id,
      guestEmail:        customer ? undefined : email,
      status:            "PENDING",
      paystackReference: reference,
      totalMinor,
      currency:          variants[0].product.currency,
      shippingAddress:   shippingAddress ?? undefined,
      items:             { create: orderItemsData },
    },
  });

  const paystackInit = await initializePaystackTransaction({
    email,
    amountMinor:  totalMinor,
    currency:     variants[0].product.currency,
    reference,
    callbackUrl: `${process.env.NEXT_PUBLIC_WEBSITE_DOMAIN ?? req.nextUrl.origin}/order-confirmation?ref=${reference}`,
  });

  return NextResponse.json({
    orderId:          order.id,
    authorizationUrl: paystackInit.data.authorization_url,
  });
}
