import { NextResponse } from "next/server";

import { auth } from "@/auth";
import {
  buildR2ObjectKey,
  sanitizeFileName,
  validateUploadFile,
  type UploadCategory,
} from "@/lib/file-upload";
import { getUserIsPro } from "@/lib/db/user";
import { uploadObject } from "@/lib/r2/storage";

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const contentLength = Number(request.headers.get("content-length") ?? "0");

  if (contentLength > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: "File too large" }, { status: 413 });
  }

  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file");
  const categoryValue = formData.get("category");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "File is required" }, { status: 400 });
  }

  if (categoryValue !== "image" && categoryValue !== "file") {
    return NextResponse.json({ error: "Invalid upload category" }, { status: 400 });
  }

  const category = categoryValue as UploadCategory;

  if (category === "file") {
    const isPro = await getUserIsPro(session.user.id);

    if (!isPro) {
      return NextResponse.json(
        { error: "File uploads require a Pro subscription" },
        { status: 403 },
      );
    }
  }

  const validationError = validateUploadFile(
    {
      name: file.name,
      type: file.type,
      size: file.size,
    },
    category,
  );

  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const fileName = sanitizeFileName(file.name);
  const key = buildR2ObjectKey(session.user.id, fileName);
  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    await uploadObject(key, buffer, file.type);
  } catch {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }

  return NextResponse.json({
    fileUrl: key,
    fileName,
    fileSize: file.size,
  });
}
