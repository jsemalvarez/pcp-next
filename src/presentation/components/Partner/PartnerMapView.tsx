'use client'
import dynamic from 'next/dynamic'

const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false })
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false })

import "leaflet/dist/leaflet.css";
import { getCustomSvgIcon } from '@/presentation/utils/getCustomSvgIcon'

interface Props{
  position: { 
    lat: number;
    lng: number; 
  }
}

export default function PartnerMapView({position}:Props){

    const icon = getCustomSvgIcon({ imageId:'feriainfinita/profile_feria_infinita_abgru6.webp', alt: "foto de perfil"})

    return(
        <MapContainer 
              center={position} 
              zoom={15} 
              scrollWheelZoom={true}
              style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />   
            <Marker 
              position={position}
              icon={icon}
            />      
        </MapContainer>
    )
}