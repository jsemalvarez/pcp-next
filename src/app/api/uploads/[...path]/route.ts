import { imageStorageMode } from "@/server/images/image.config";
import { readLocalImage } from "@/server/images/local";

export const runtime = "nodejs";

/** Sirve las imágenes subidas en desarrollo (photoId "local/..."). En producción no existe. */
export async function GET(_req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  if (imageStorageMode() !== "local") return new Response(null, { status: 404 });

  const image = await readLocalImage((await params).path);
  if (!image) return new Response(null, { status: 404 });

  return new Response(new Uint8Array(image.bytes), {
    headers: { "Content-Type": image.contentType, "Cache-Control": "public, max-age=31536000, immutable" },
  });
}
