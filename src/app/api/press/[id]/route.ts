// app/api/press/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withStaffSession } from "@/lib/auth";
import { deleteAsset } from "@/lib/cloudinary";

type Params = { params: Promise<{ id: string }> };

export function DELETE(req: NextRequest, { params }: Params) {
  return withStaffSession(req, ["ADMIN"], async () => {
    const { id } = await params;
    const asset = await prisma.pressAsset.findUnique({ where: { id } });
    if (!asset) return new NextResponse("Not found", { status: 404 });

    if (asset.fileKey) {
      const resourceType = asset.type === "rider" ? "raw" : "image";
      await deleteAsset(asset.fileKey, resourceType).catch(() => {
        // Log but don't block — Cloudinary delete failure shouldn't prevent DB cleanup
        console.error(`Failed to delete Cloudinary asset ${asset.fileKey}`);
      });
    }

    await prisma.pressAsset.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  });
}
