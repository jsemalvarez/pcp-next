import { createHash } from "node:crypto";
import { ALLOWED_FORMATS, type ImageFolder } from "./image.config";

/**
 * Subida firmada a Cloudinary. El servidor firma los parámetros y el navegador sube directo
 * (así la imagen no pasa por Vercel, que limita el cuerpo de los pedidos a 4,5 MB).
 * Reemplaza al upload preset unsigned, que permitía subir a cualquiera que lo conociera.
 * Docs: https://cloudinary.com/documentation/authentication_signatures
 */

export function cloudinaryCloudName() {
  return process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dnpmw1mty";
}

export interface SignedUpload {
  uploadUrl: string;
  /** Campos a enviar junto con `file` en el FormData */
  fields: Record<string, string>;
}

export function signCloudinaryUpload(folder: ImageFolder): SignedUpload {
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!apiKey || !apiSecret) {
    throw new Error("Faltan CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET");
  }

  // Todo lo que se firma queda fijo: Cloudinary rechaza la subida si el navegador lo cambia.
  // La firma vence a la hora (Cloudinary valida el timestamp).
  const params: Record<string, string> = {
    allowed_formats: ALLOWED_FORMATS.join(","),
    folder,
    timestamp: Math.floor(Date.now() / 1000).toString(),
  };
  const toSign = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");
  const signature = createHash("sha1").update(toSign + apiSecret).digest("hex");

  return {
    uploadUrl: `https://api.cloudinary.com/v1_1/${cloudinaryCloudName()}/image/upload`,
    fields: { ...params, api_key: apiKey, signature },
  };
}
