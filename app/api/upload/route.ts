import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/auth";
import {
  ALLOWED_IMAGE_TYPES,
  MAX_UPLOAD_BYTES,
  UPLOAD_FOLDER,
  cloudinaryConfigured,
  deleteImage,
  uploadImage,
} from "@/lib/cloudinary";

export const runtime = "nodejs";

/** Admin-only image upload to Cloudinary. */
export async function POST(request: Request) {
  if (!(await getAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 403 });
  if (!cloudinaryConfigured) return NextResponse.json({ error: "cloudinary_not_configured" }, { status: 500 });

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "no_file" }, { status: 400 });
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) return NextResponse.json({ error: "bad_type" }, { status: 400 });
  if (file.size > MAX_UPLOAD_BYTES) return NextResponse.json({ error: "too_large" }, { status: 400 });

  try {
    const image = await uploadImage(Buffer.from(await file.arrayBuffer()), file.name);
    return NextResponse.json(image);
  } catch {
    return NextResponse.json({ error: "upload_failed" }, { status: 502 });
  }
}

/** Removes an image the admin uploaded but decided not to keep. */
export async function DELETE(request: Request) {
  if (!(await getAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 403 });

  const { publicId } = (await request.json().catch(() => ({}))) as { publicId?: string };
  // Only ever touch this app's own upload folder
  if (!publicId || !publicId.startsWith(`${UPLOAD_FOLDER}/`)) return NextResponse.json({ error: "bad_id" }, { status: 400 });

  await deleteImage(publicId);
  return NextResponse.json({ ok: true });
}
