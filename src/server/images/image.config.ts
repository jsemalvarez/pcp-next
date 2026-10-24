/**
 * Configuración de imágenes compartida por la firma de Cloudinary y el almacenamiento local.
 *
 * IMAGE_STORAGE=local      → desarrollo: los archivos se guardan en ./.uploads (ignorado por git)
 * IMAGE_STORAGE=cloudinary → producción (por defecto): el navegador sube directo a Cloudinary
 *                            con una firma que genera el servidor
 */

export const IMAGE_FOLDERS = ["events", "places", "organizers", "news", "banners"] as const;
export type ImageFolder = (typeof IMAGE_FOLDERS)[number];

export function isImageFolder(value: unknown): value is ImageFolder {
  return typeof value === "string" && (IMAGE_FOLDERS as readonly string[]).includes(value);
}

/** 10 MB: el máximo por imagen del plan gratuito de Cloudinary */
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

export const ALLOWED_FORMATS = ["jpg", "png", "webp", "gif"] as const;

export type ImageStorageMode = "cloudinary" | "local";

export function imageStorageMode(): ImageStorageMode {
  // En Vercel el disco es de solo lectura: ahí siempre Cloudinary
  if (process.env.IMAGE_STORAGE === "local" && !process.env.VERCEL) return "local";
  return "cloudinary";
}

/** Tipo real del archivo según sus primeros bytes (no se confía en la extensión ni en el MIME del navegador) */
export function detectImageFormat(bytes: Uint8Array): (typeof ALLOWED_FORMATS)[number] | null {
  const startsWith = (...sig: number[]) => sig.every((b, i) => bytes[i] === b);
  if (startsWith(0xff, 0xd8, 0xff)) return "jpg";
  if (startsWith(0x89, 0x50, 0x4e, 0x47)) return "png";
  if (startsWith(0x47, 0x49, 0x46, 0x38)) return "gif";
  const ascii = (from: number, to: number) => String.fromCharCode(...bytes.slice(from, to));
  if (ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") return "webp";
  return null;
}
