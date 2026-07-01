// app/api/upload-signature/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withStaffSession } from "@/lib/auth";
import { getSignedUploadParams, FOLDERS } from "@/lib/cloudinary";

// Maps a logical asset type to the correct Cloudinary folder + access mode.
// Tracks and riders are authenticated (private delivery); everything else
// is public. This map is the single place to change that policy.
const ASSET_CONFIG: Record<
  string,
  { folder: string; accessMode: "public" | "authenticated"; resourceType: "image" | "video" | "raw" | "auto" }
> = {
  cover:    { folder: FOLDERS.COVERS,   accessMode: "public",        resourceType: "image" },
  photo:    { folder: FOLDERS.PHOTOS,   accessMode: "public",        resourceType: "image" },
  preview:  { folder: FOLDERS.PREVIEWS, accessMode: "public",        resourceType: "video" }, // Cloudinary uses "video" for audio
  track:    { folder: FOLDERS.TRACKS,   accessMode: "authenticated", resourceType: "video" },
  rider:    { folder: FOLDERS.RIDERS,   accessMode: "authenticated", resourceType: "raw"   },
  merch:    { folder: FOLDERS.MERCH,    accessMode: "public",        resourceType: "image" },
};

const Schema = z.object({
  assetType: z.enum(["cover", "photo", "preview", "track", "rider", "merch"]),
});

export function POST(req: NextRequest) {
  return withStaffSession(req, ["ADMIN", "EDITOR"], async () => {
    const body = Schema.safeParse(await req.json());
    if (!body.success) {
      return NextResponse.json({ error: body.error.flatten() }, { status: 400 });
    }

    const config = ASSET_CONFIG[body.data.assetType];
    const params = getSignedUploadParams({
      folder: config.folder,
      accessMode: config.accessMode,
      resourceType: config.resourceType,
    });

    return NextResponse.json(params);
  });
}
