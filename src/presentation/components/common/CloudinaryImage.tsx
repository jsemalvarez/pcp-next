import Image from "next/image";
import { imageUrl as buildImageUrl } from "@/presentation/utils/imageUrl";

interface Props {
  imageName?: string;
  alt?: string;
  className?: string;
  actualWidth?: number | null;
  actualHeight?: number | null;
  fallbackImage?: string;
}

export const CloudinaryImage = ({
  imageName,
  alt = "",
  className = "",
  actualWidth,
  actualHeight,
  fallbackImage,
}: Props) => {
  // Si no hay imagen, usamos una imagen por defecto local
  const finalFallback = fallbackImage || "/images/fallbackImage.webp";
  
  // El photoId guardado ya trae la carpeta (ej. 'events/nombre.jpg'); los viejos sin carpeta son de eventos
  const imageUrl = imageName ? buildImageUrl(imageName, { width: 600, defaultFolder: "events" }) : finalFallback;

  const width = actualWidth || 600;
  const height = actualHeight || 400;

  return (
    <Image
      src={imageUrl}
      alt={alt}
      width={width}
      height={height}
      className={className}
      loading="lazy"
      unoptimized={true}
    />
  );
}
