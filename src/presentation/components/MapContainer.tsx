"use client";

import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';

// Fix for default marker icons in Leaflet + Next.js
const DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

export interface Place {
    id: number;
    name: string;
    lat: number;
    lng: number;
    category: string;
    description: string;
    address?: string;
    hours?: string;
}

export const mockPlaces: Place[] = [
    {
        id: 1,
        name: "Museo MAR",
        lat: -37.9789,
        lng: -57.5444,
        category: "Museo",
        description: "El Museo de Arte Contemporáneo de la Provincia de Buenos Aires es uno de los museos más modernos del país. Su icónico lobo de mar gigante, hecho con envoltorios de alfajores, es el punto preferido para fotos.",
        address: "Av. Félix U. Camet & López de Gomara",
        hours: "Mar a Dom: 10:00 - 19:00"
    },
    {
        id: 2,
        name: "Aquarium Mar del Plata",
        lat: -38.0847,
        lng: -57.5408,
        category: "Paseo",
        description: "Uno de los parques marinos más importantes de Argentina. Ofrece exhibiciones de delfines, lobos marinos y una gran variedad de peces y aves marinas. Ideal para un día entero en familia.",
        address: "Av. de los Trabajadores 5600",
        hours: "Todos los días: 10:00 - 18:00"
    },
    {
        id: 3,
        name: "Parque Primavesi",
        lat: -38.0289,
        lng: -57.5428,
        category: "Parque",
        description: "Un hermoso espacio verde con amplios sectores de juegos para niños de todas las edades. Cuenta con una variada oferta de food trucks y es el lugar ideal para el picnic de la tarde.",
        address: "Av. Juan B. Justo & Urquiza",
        hours: "Abierto 24hs"
    },
    {
        id: 4,
        name: "Torre Tanque",
        lat: -38.0108,
        lng: -57.5447,
        category: "Paseo",
        description: "Declarada Monumento Histórico Nacional. Se puede subir por ascensor o escalera para tener la mejor vista panorámica de 360 grados de toda la ciudad de Mar del Plata.",
        address: "Falucho 995",
        hours: "Lun a Vie: 08:00 - 15:00"
    }
];

function MapController({ selectedPlace }: { selectedPlace: Place | null }) {
    const map = useMap();
    useEffect(() => {
        if (selectedPlace) {
            map.flyTo([selectedPlace.lat, selectedPlace.lng], 15, {
                duration: 1.5
            });
        }
    }, [selectedPlace, map]);
    return null;
}

interface MapProps {
    onSelectPlace: (place: Place) => void;
    selectedPlace: Place | null;
}

export default function SimpleMap({ onSelectPlace, selectedPlace }: MapProps) {
    const defaultCenter: [number, number] = [-38.0055, -57.5426];

    return (
        <MapContainer
            center={defaultCenter}
            zoom={13}
            style={{ height: '100%', width: '100%', zIndex: 0 }}
            zoomControl={false}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                url='https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
            />

            <MapController selectedPlace={selectedPlace} />

            {mockPlaces.map((place) => (
                <Marker
                    key={place.id}
                    position={[place.lat, place.lng]}
                    eventHandlers={{
                        click: () => onSelectPlace(place)
                    }}
                />
            ))}
        </MapContainer>
    );
}
