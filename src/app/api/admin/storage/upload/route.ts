import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/server/auth";
import {
  getStorageBucketName,
  getSupabaseStorageAdminClient,
} from "@/lib/server/storage";

const allowedFolders = new Set(["products", "settings"]);

function getFileExtension(file: File) {
  const explicitExtension = file.name.split(".").pop()?.trim().toLowerCase();
  if (explicitExtension) {
    return explicitExtension;
  }

  switch (file.type) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
    case "image/svg+xml":
      return "svg";
    case "image/avif":
      return "avif";
    default:
      return "bin";
  }
}

export async function POST(request: NextRequest) {
  const adminResponse = await requireAdminApi();
  if (adminResponse) {
    return adminResponse;
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const folder = formData.get("folder");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Image file is required" }, { status: 400 });
  }

  if (typeof folder !== "string" || !allowedFolders.has(folder)) {
    return NextResponse.json({ error: "Invalid upload folder" }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Only image uploads are supported" }, { status: 400 });
  }

  const client = await getSupabaseStorageAdminClient();
  const bucket = getStorageBucketName();
  const fileExtension = getFileExtension(file);
  const filePath = `${folder}/${Date.now()}-${randomUUID()}.${fileExtension}`;
  const fileBuffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await client.storage.from(bucket).upload(filePath, fileBuffer, {
    cacheControl: "3600",
    contentType: file.type,
    upsert: false,
  });

  if (uploadError) {
    return NextResponse.json(
      { error: `Unable to upload image: ${uploadError.message}` },
      { status: 500 },
    );
  }

  const {
    data: { publicUrl },
  } = client.storage.from(bucket).getPublicUrl(filePath);

  return NextResponse.json({
    path: filePath,
    url: publicUrl,
  });
}
