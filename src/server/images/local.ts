import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { detectImageFormat, MAX_IMAGE_BYTES, type ImageFolder } from "./image.config";
import { ValidationError } from "@/server/shared/validation";

/**
 * Almacenamiento de imágenes en disco para desarrollo (IMAGE_STORAGE=local).
 * Los photoId empiezan con "local/" y se sirven desde /api/uploads; las fotos de una copia
 * de producción se siguen viendo desde Cloudinary.
 */

const UPLOADS_DIR = path.join(process.cwd(), ".uploads");

const CONTENT_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
};

export interface StoredImage {
  photoId: string;
  width: number | null;
  height: number | null;
}

/** Ancho y alto con sharp (viene con Next); si no está disponible, sin dimensiones */
async function readDimensions(bytes: Buffer) {
  try {
    const { default: sharp } = await import("sharp");
    const { width, height } = await sharp(bytes).metadata();
    return { width: width ?? null, height: height ?? null };
  } catch {
    return { width: null, height: null };
  }
}

export async function saveLocalImage(bytes: Buffer, folder: ImageFolder): Promise<StoredImage> {
  if (bytes.length > MAX_IMAGE_BYTES) throw new ValidationError("La imagen supera los 10 MB.");
  const format = detectImageFormat(bytes);
  if (!format) throw new ValidationError("Formato no permitido: subí una imagen JPG, PNG, WEBP o GIF.");

  const fileName = `${randomUUID()}.${format}`;
  await mkdir(path.join(UPLOADS_DIR, folder), { recursive: true });
  await writeFile(path.join(UPLOADS_DIR, folder, fileName), bytes);

  return { photoId: `local/${folder}/${fileName}`, ...(await readDimensions(bytes)) };
}

/** Lee un archivo de .uploads. Devuelve null si no existe o si la ruta intenta salir de la carpeta. */
export async function readLocalImage(segments: string[]) {
  const filePath = path.resolve(UPLOADS_DIR, ...segments);
  if (!filePath.startsWith(UPLOADS_DIR + path.sep)) return null;
  const ext = path.extname(filePath).slice(1).toLowerCase();
  const contentType = CONTENT_TYPES[ext];
  if (!contentType) return null;
  try {
    return { bytes: await readFile(filePath), contentType };
  } catch {
    return null;
  }
}
