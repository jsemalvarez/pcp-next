'use client'

import dynamic from 'next/dynamic'

import { Place } from '@/domain/entities/Place'
import { MapContainer, TileLayer } from 'react-leaflet'

const Markers = dynamic(() => import('./Markers'), {
  ssr: false,
})

export const initLatLng = { lat:-38.00022116740122, lng:-57.551784619277406 }

interface Props{ 
    children?: React.ReactNode 
    places: Place[]
}

export default function MapView({ children, places }:Props ) {
    return (
        <MapContainer 
            center={initLatLng} zoom={14} 
            scrollWheelZoom={true}
            style={{ height: '100%', width: '100%' }}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />            
            <Markers places={places} />
            { children }
        </MapContainer>
    )
}