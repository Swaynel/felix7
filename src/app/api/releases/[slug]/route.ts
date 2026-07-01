// app/api/releases/[slug]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { withStaffSession } from "@/lib/auth";
import { deleteAsset } from "@/lib/cloudinary";

type Params = { params: Promise<{ slug: string }> };

// GET /api/releases/[slug] — public
export async function GET(_req: NextRequest, { params }: Params) {
  const { slug } = await params;
  const release = await prisma.release.findUnique({
    where: { slug },
    include: { tracks: { orderBy: { trackNumber: "asc" } }, products: true },
  });
  if (!release) return new NextResponse("Not found", { status: 404 });
  return NextResponse.json(release);
}

const UpdateSchema = z.object({
  title:          z.string().min(1).optional(),
  releaseDate:    z.string().datetime().optional(),
  coverPublicId:  z.string().optional(),
  description:    z.string().optional(),
  streamingLinks: z.record(z.string(), z.string()).optional(),
  published:      z.boolean().optional(),
}).strict();

// PATCH /api/releases/[slug] — admin/editor
export function PATCH(req: NextRequest, { params }: Params) {
  return withStaffSession(req, ["ADMIN", "EDITOR"], async () => {
    const { slug } = await params;
    const body = UpdateSchema.safeParse(await req.json());
    if (!body.success) return NextResponse.json({ error: body.error.flatten() }, { status: 400 });

    const { coverPublicId, releaseDate, ...rest } = body.data;
    const release = await prisma.release.update({
      where: { slug },
      data: {
        ...rest,
        ...(coverPublicId && { coverArtKey: coverPublicId }),
        ...(releaseDate   && { releaseDate: new Date(releaseDate) }),
      },
    });
    return NextResponse.json(release);
  });
}

// DELETE /api/releases/[slug] — admin only
export function DELETE(req: NextRequest, { params }: Params) {
  return withStaffSession(req, ["ADMIN"], async () => {
    const { slug } = await params;
    const release = await prisma.release.findUnique({
      where: { slug },
      include: { tracks: true },
    });
    if (!release) return new NextResponse("Not found", { status: 404 });

    await Promise.allSettled([
      deleteAsset(release.coverArtKey, "image"),
      ...release.tracks.flatMap((t) => [
        t.previewKey  ? deleteAsset(t.previewKey,  "video") : null,
        t.fullFileKey ? deleteAsset(t.fullFileKey, "video") : null,
      ]).filter(Boolean) as Promise<void>[],
    ]);

    await prisma.release.delete({ where: { slug } });
    return new NextResponse(null, { status: 204 });
  });
}
