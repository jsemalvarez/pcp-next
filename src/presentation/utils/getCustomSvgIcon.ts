import L from 'leaflet';

interface Props{
    imageId: string;
    alt?: string;
}

export const getCustomSvgIcon = ({ imageId, alt = ""}:Props) => {

  const baseUrl = 'https://res.cloudinary.com/dwhdla1b4/image/upload';
  const folder = 'v1749595725/pcp-images';
  const fallbackImage = `${baseUrl}/w_600,q_auto,f_auto/${folder}/logo_pcp_mppj0w.webp`;
        
  const svg = `
    <div class="custom-marker">
      <img
        src="${baseUrl}/w_600,q_auto,f_auto/${folder}/${imageId}"
        srcSet="
          ${baseUrl}/w_300,q_auto,f_auto/${folder}/${imageId} 300w,
          ${baseUrl}/w_600,q_auto,f_auto/${folder}/${imageId} 600w,
          ${baseUrl}/w_1000,q_auto,f_auto/${folder}/${imageId} 1000w,
          ${baseUrl}/w_1600,q_auto,f_auto/${folder}/${imageId} 1600w"
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