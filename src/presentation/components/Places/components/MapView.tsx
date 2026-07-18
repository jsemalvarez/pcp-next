'use client'

import dynamic from 'next/dynamic'
import { useEffect } from 'react'

import { Place } from '@/domain/entities/Place'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'

const Markers = dynamic(() => import('./Markers'), {
  ssr: false,
})

export const initLatLng = { lat:-38.00022116740122, lng:-57.551784619277406 }

interface Props{ 
    children?: React.ReactNode;
    places: Place[];
    setSetselectedPlace: (place:Place | null) => void;
}

function MapResizer() {
  const map = useMap()
  useEffect(() => {
    const container = map.getContainer()
    if (!container) return

    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize()
    })

    resizeObserver.observe(container)

    map.invalidateSize()
    const timer = setTimeout(() => {
      map.invalidateSize()
    }, 400)
    
    return () => {
      resizeObserver.disconnect()
      clearTimeout(timer)
    }
  }, [map])
  return null
}

export default function MapView({ children, places, setSetselectedPlace }:Props ) {
    return (
        <MapContainer 
            center={initLatLng} zoom={12} 
            scrollWheelZoom={true}
            style={{ height: '100%', width: '100%' }}
        >
            <MapResizer />
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />            
            <Markers 
                places={places} 
                setSetselectedPlace={setSetselectedPlace}
            />
            { children }
        </MapContainer>
    )
}