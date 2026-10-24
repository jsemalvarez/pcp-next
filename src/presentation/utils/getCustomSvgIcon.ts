import L from 'leaflet';
import { imageUrl } from './imageUrl';

interface Props{
    imageId: string;
    alt?: string;
}

export const getCustomSvgIcon = ({ imageId, alt = ""}:Props) => {

  const fallbackImage = imageUrl('logo_pcp_mppj0w.webp', { width: 600 });
        
  const svg = `
    <div class="custom-marker">
      <img
        src="${imageUrl(imageId, { width: 600 })}"
        srcSet="
          ${imageUrl(imageId, { width: 300 })} 300w,
          ${imageUrl(imageId, { width: 600 })} 600w,
          ${imageUrl(imageId, { width: 1000 })} 1000w,
          ${imageUrl(imageId, { width: 1600 })} 1600w"
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