import L from 'leaflet';

interface Props{
    bgColor: string;
    svgIconType: string;
}

export const createSvgIcon = ({ bgColor, svgIconType }:Props) => {
    
    const svg = `
    <svg width="50" height="50" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <rect x="10" y="10" width="180" height="130" rx="30" ry="30" stroke="#fff" stroke-width="4" fill="${bgColor}" />
        <polygon points="60,140 140,140 100,190" stroke="#fff" stroke-width="4" fill="${bgColor}" />
        <line x1="64" y1="140" x2="136" y2="140" stroke="${bgColor}" stroke-width="10"/>

        ${svgIconType}

    </svg>
  `

    return L.divIcon({
      html: svg,
      className: '',
      iconSize: [46,46],
      iconAnchor: [23, 46],
    })
  }