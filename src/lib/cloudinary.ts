import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
  secure: true,
});

export { cloudinary };

export const FOLDERS = {
  COVERS:   "musician/covers",      // public
  PHOTOS:   "musician/press/photos",// public
  PREVIEWS: "musician/previews",    // public (short audio clips)
  TRACKS:   "musician/tracks",      // authenticated (full purchased files)
  RIDERS:   "musician/riders",      // authenticated (tech/stage riders)
  MERCH:    "musician/merch",       // public (product images)
} as const;

// ── Signed upload params (server → client) ───────────────────────────────

interface UploadSignatureParams {
  folder: string;
  resourceType?: "image" | "video" | "raw" | "auto";
  accessMode?: "public" | "authenticated";
}


export function getSignedUploadParams(params: UploadSignatureParams) {
  const timestamp = Math.round(Date.now() / 1000);
  const toSign: Record<string, string | number> = {
    timestamp,
    folder: params.folder,
    ...(params.accessMode === "authenticated" && { access_mode: "authenticated" }),
  };

  const signature = cloudinary.utils.api_sign_request(
    toSign,
    process.env.CLOUDINARY_API_SECRET!
  );

  return {
    signature,
    timestamp,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    folder: params.folder,
    resourceType: params.resourceType ?? "auto",
    accessMode: params.accessMode ?? "public",
  };
}

export function getSignedDeliveryUrl(
  publicId: string,
  resourceType: "video" | "raw" | "image" = "video",
  expirySeconds = 300
): string {
  const expiresAt = Math.round(Date.now() / 1000) + expirySeconds;
  return cloudinary.utils.private_download_url(publicId, "mp3", {
    resource_type: resourceType,
    expires_at: expiresAt,
    attachment: true, // forces download rather than inline play — correct for purchased files
  });
}

export function getPublicUrl(
  publicId: string,
  resourceType: "image" | "video" | "raw" = "image",
  transformations?: Record<string, unknown>
): string {
  return cloudinary.url(publicId, {
    resource_type: resourceType,
    secure: true,
    ...transformations,
  });
}

export async function deleteAsset(
  publicId: string,
  resourceType: "image" | "video" | "raw" = "image"
): Promise<void> {
  await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
}