import L from 'leaflet';

interface Props{
    imageId: string;
    alt?: string;
}

export const getCustomSvgIcon = ({ imageId, alt = ""}:Props) => {

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dnpmw1mty";
  const baseUrl = `https://res.cloudinary.com/${cloudName}/image/upload`;
  const fallbackImage = `${baseUrl}/w_600,q_auto,f_auto/logo_pcp_mppj0w.webp`;
        
  const svg = `
    <div class="custom-marker">
      <img
        src="${baseUrl}/w_600,q_auto,f_auto/${imageId}"
        srcSet="
          ${baseUrl}/w_300,q_auto,f_auto/${imageId} 300w,
          ${baseUrl}/w_600,q_auto,f_auto/${imageId} 600w,
          ${baseUrl}/w_1000,q_auto,f_auto/${imageId} 1000w,
          ${baseUrl}/w_1600,q_auto,f_auto/${imageId} 1600w"
        sizes="(max-width: 600px) 300px,
                (max-width: 1024px) 600px,
                (max-width: 1600px) 1000px,
                1600px"
        alt="${alt}"
        loading="lazy"
        decoding="async"
        onerror="this.onerror=null;this.src='${fallbackImage}';this.srcset='';"
      />
    </div>
    `

    return L.divIcon({
      html: svg,
      className: '',
      // iconSize: [60,60],
      iconAnchor: [42, 58],
    })
}