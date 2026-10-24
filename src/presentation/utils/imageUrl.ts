/**
 * Único lugar que arma la URL de una imagen a partir del photoId guardado en la base.
 * - "local/..." → imagen subida en desarrollo, servida por /api/uploads (sin transformaciones)
 * - cualquier otro → Cloudinary, con las transformaciones pedidas
 */

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dnpmw1mty";
const CLOUDINARY_BASE = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload`;

export interface ImageUrlOptions {
  width?: number;
  height?: number;
  /** "fill" recorta para llenar width × height */
  crop?: "fill";
  /** Sin transformaciones: el archivo original */
  original?: boolean;
  /**
   * Carpeta a anteponer si el photoId no tiene ninguna. Algunas fotos viejas se guardaron
   * sin carpeta (ej. "foto.jpg" en vez de "events/foto.jpg").
   */
  defaultFolder?: string;
}

export function imageUrl(photoId: string, options: ImageUrlOptions = {}) {
  if (photoId.startsWith("local/")) return `/api/uploads/${photoId.slice("local/".length)}`;

  const id = options.defaultFolder && !photoId.includes("/") ? `${options.defaultFolder}/${photoId}` : photoId;
  if (options.original) return `${CLOUDINARY_BASE}/${id}`;

  const transformations = [
    options.width && `w_${options.width}`,
    options.height && `h_${options.height}`,
    options.crop && `c_${options.crop}`,
    "q_auto",
    "f_auto",
  ].filter(Boolean);
  return `${CLOUDINARY_BASE}/${transformations.join(",")}/${id}`;
}
