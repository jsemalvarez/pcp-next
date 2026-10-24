import { NextResponse } from "next/server";
import { requireAdmin, UnauthorizedError } from "@/server/auth/require-admin";
import { signCloudinaryUpload } from "@/server/images/cloudinary";
import { imageStorageMode, isImageFolder } from "@/server/images/image.config";

/**
 * Prepara una subida de imagen desde el admin.
 * - cloudinary: devuelve la URL de Cloudinary y los campos firmados para subir directo desde el navegador.
 * - local: indica que se suba a /api/images (desarrollo).
 */
export async function POST(req: Request) {
  try {
    await requireAdmin();
  } catch (error) {
    if (error instanceof UnauthorizedError) return NextResponse.json({ error: error.message }, { status: 401 });
    throw error;
  }

  const { folder } = (await req.json().catch(() => ({}))) as { folder?: unknown };
  if (!isImageFolder(folder)) return NextResponse.json({ error: "Carpeta inválida" }, { status: 400 });

  if (imageStorageMode() === "local") {
    return NextResponse.json({ mode: "local", uploadUrl: "/api/images", fields: { folder } });
  }

  try {
    return NextResponse.json({ mode: "cloudinary", ...signCloudinaryUpload(folder) });
  } catch (error) {
    console.error("[images/sign] Error", error);
    return NextResponse.json({ error: "La subida de imágenes no está configurada en el servidor." }, { status: 500 });
  }
}
