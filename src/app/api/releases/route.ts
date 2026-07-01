import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { withStaffSession } from "@/lib/auth";

// GET /api/releases — public, no auth
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const onlyPublished = searchParams.get("published") !== "false";

  const releases = await prisma.release.findMany({
    where: onlyPublished ? { published: true } : {},
    include: { tracks: { orderBy: { trackNumber: "asc" } } },
    orderBy: { releaseDate: "desc" },
  });

  return NextResponse.json(releases);
}

const ReleaseSchema = z.object({
  title:          z.string().min(1),
  slug:           z.string().min(1).regex(/^[a-z0-9-]+$/, "slug must be lowercase alphanumeric with hyphens"),
  releaseDate:    z.string().datetime(),
  coverPublicId:  z.string().min(1), // Cloudinary public_id returned after upload
  description:    z.string().optional(),
  streamingLinks: z.record(z.string(), z.string()).optional(),
  published:      z.boolean().optional(),
  tracks: z.array(z.object({
    title:          z.string().min(1),
    trackNumber:    z.number().int().positive(),
    durationSec:    z.number().int().optional(),
    previewPublicId: z.string().optional(),
    fullFilePublicId: z.string().optional(),
  })).optional(),
});

// POST /api/releases — admin/editor only
export function POST(req: NextRequest) {
  return withStaffSession(req, ["ADMIN", "EDITOR"], async () => {
    const body = ReleaseSchema.safeParse(await req.json());
    if (!body.success) {
      return NextResponse.json({ error: body.error.flatten() }, { status: 400 });
    }

    const { coverPublicId, tracks, ...releaseData } = body.data;

    const release = await prisma.release.create({
      data: {
        ...releaseData,
        coverArtKey: coverPublicId,
        releaseDate: new Date(releaseData.releaseDate),
        tracks: tracks ? { create: tracks.map((t) => ({
          title:       t.title,
          trackNumber: t.trackNumber,
          durationSec: t.durationSec,
          previewKey:  t.previewPublicId,
          fullFileKey: t.fullFilePublicId,
        }))} : undefined,
      },
      include: { tracks: true },
    });

    return NextResponse.json(release, { status: 201 });
  });
}
