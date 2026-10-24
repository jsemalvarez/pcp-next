/**
 * Sube una imagen desde el admin. El servidor decide adónde (/api/images/sign):
 * - producción: directo a Cloudinary con una firma del servidor
 * - desarrollo (IMAGE_STORAGE=local): a /api/images, que la guarda en ./.uploads
 */

export type ImageFolder = "events" | "places" | "organizers" | "news" | "banners";

export interface UploadedImage {
  photoId: string;
  width: number | null;
  height: number | null;
}

const MAX_BYTES = 10 * 1024 * 1024;

async function errorMessage(res: Response, fallback: string) {
  const body = await res.json().catch(() => null);
  return body?.error?.message ?? body?.error ?? fallback;
}

export async function uploadImage(file: File, folder: ImageFolder): Promise<UploadedImage> {
  if (file.size > MAX_BYTES) throw new Error("La imagen supera los 10 MB.");

  const signRes = await fetch("/api/images/sign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ folder }),
  });
  if (!signRes.ok) throw new Error(await errorMessage(signRes, "No se pudo preparar la subida de la imagen."));
  const { mode, uploadUrl, fields } = (await signRes.json()) as {
    mode: "cloudinary" | "local";
    uploadUrl: string;
    fields: Record<string, string>;
  };

  const data = new FormData();
  data.append("file", file);
  for (const [key, value] of Object.entries(fields)) data.append(key, value);

  const res = await fetch(uploadUrl, { method: "POST", body: data });
  if (!res.ok) throw new Error(await errorMessage(res, "Error al subir la imagen."));
  const result = await res.json();

  if (mode === "local") return result as UploadedImage;
  return { photoId: `${result.public_id}.${result.format}`, width: result.width, height: result.height };
}
