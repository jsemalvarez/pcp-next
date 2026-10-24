import { NextResponse } from "next/server";
import { requireAdmin, UnauthorizedError } from "@/server/auth/require-admin";
import { imageStorageMode, isImageFolder } from "@/server/images/image.config";
import { saveLocalImage } from "@/server/images/local";
import { ValidationError } from "@/server/shared/validation";

export const runtime = "nodejs";

/** Subida de imágenes al disco local. Solo existe con IMAGE_STORAGE=local (en producción se sube a Cloudinary). */
export async function POST(req: Request) {
  if (imageStorageMode() !== "local") return new NextResponse(null, { status: 404 });

  try {
    await requireAdmin();
    const form = await req.formData();
    const file = form.get("file");
    const folder = form.get("folder");
    if (!(file instanceof File)) return NextResponse.json({ error: "Falta el archivo" }, { status: 400 });
    if (!isImageFolder(folder)) return NextResponse.json({ error: "Carpeta inválida" }, { status: 400 });

    const image = await saveLocalImage(Buffer.from(await file.arrayBuffer()), folder);
    return NextResponse.json(image, { status: 201 });
  } catch (error) {
    if (error instanceof UnauthorizedError) return NextResponse.json({ error: error.message }, { status: 401 });
    if (error instanceof ValidationError) return NextResponse.json({ error: error.message }, { status: 400 });
    console.error("[images] Error", error);
    return NextResponse.json({ error: "Error al guardar la imagen" }, { status: 500 });
  }
}
