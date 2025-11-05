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
  const baseUrl = "https://res.cloudinary.com/dwhdla1b4/image/upload";
  const folder = "v1749595725/pcp-images";
  const fallbackImage = `${baseUrl}/w_600,q_auto,f_auto/${folder}/logo_pcp_mppj0w.webp`;
  const photoUrl = `${baseUrl}/w_600,q_auto,f_auto/${folder}/${imageName}`

  const imageUrl = imageName
    ? photoUrl
    : fallbackImage;

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
