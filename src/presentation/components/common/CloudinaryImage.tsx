import Image from "next/image";

interface Props {
  imageName?: string;
  alt?: string;
  className?: string;
  actualWidth?: number | null;
  actualHeight?: number | null;
}

export const CloudinaryImage = ({
  imageName,
  alt = "",
  className = "",
  actualWidth,
  actualHeight,
}: Props) => {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dnpmw1mty";
  const baseUrl = `https://res.cloudinary.com/${cloudName}/image/upload`;
  
  // Si no hay imagen, usamos una imagen por defecto local
  const fallbackImage = "/images/img-molinos.webp";
  
  // Dado que el photoId guardado ya contiene la subcarpeta (ej. 'events/nombre.jpg'), 
  // solo lo concatenamos directamente a la URL base.
  const formattedImageName = imageName?.includes('/') ? imageName : `events/${imageName}`;
  const photoUrl = `${baseUrl}/w_600,q_auto,f_auto/${formattedImageName}`;

  const imageUrl = imageName ? photoUrl : fallbackImage;

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
