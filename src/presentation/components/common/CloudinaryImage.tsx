import Image from "next/image";

interface Props {
  imageName?: string;
  alt?: string;
  className?: string;
}

export const CloudinaryImage = ({
  imageName,
  alt = "",
  className = "",
}: Props) => {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dnpmw1mty";
  const baseUrl = `https://res.cloudinary.com/${cloudName}/image/upload`;
  
  // Si no hay imagen, usamos una imagen por defecto local
  const fallbackImage = "/images/img-molinos.webp";
  
  // Dado que el photoId guardado ya contiene la subcarpeta (ej. 'events/nombre.jpg'), 
  // solo lo concatenamos directamente a la URL base.
  const photoUrl = `${baseUrl}/w_600,q_auto,f_auto/${imageName}`;

  const imageUrl = imageName ? photoUrl : fallbackImage;

  return (
    <Image
      src={imageUrl}
      alt={alt}
      width={600}
      height={400}
      className={className}
      loading="lazy"
      unoptimized={true}
    />
  );
}
