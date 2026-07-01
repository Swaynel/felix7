// app/api/press/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { withStaffSession } from "@/lib/auth";

// GET /api/press — public
export async function GET() {
  const assets = await prisma.pressAsset.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(assets);
}

const PressSchema = z.object({
  type:      z.enum(["photo", "rider", "bio", "video_link"]),
  label:     z.string().min(1),
  publicId:  z.string().optional(),  // Cloudinary public_id
  url:       z.string().url().optional(), // for video_link type
}).refine(
  (d) => d.type === "video_link" ? !!d.url : !!d.publicId,
  { message: "video_link type requires url; all other types require publicId" }
);

export function POST(req: NextRequest) {
  return withStaffSession(req, ["ADMIN", "EDITOR"], async () => {
    const body = PressSchema.safeParse(await req.json());
    if (!body.success) return NextResponse.json({ error: body.error.flatten() }, { status: 400 });

    const asset = await prisma.pressAsset.create({
      data: {
        type:    body.data.type,
        label:   body.data.label,
        fileKey: body.data.publicId,
        url:     body.data.url,
      },
    });
    return NextResponse.json(asset, { status: 201 });
  });
}
