"use client";

import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';
import { Place, PlaceCategory } from '@/domain/entities/Place';
import { getCategoryLabel } from '@/presentation/utils/category';

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
    places: Place[];
    onSelectPlace: (place: Place) => void;
    selectedPlace: Place | null;
}

export default function SimpleMap({ places, onSelectPlace, selectedPlace }: MapProps) {
    const defaultCenter: [number, number] = [-38.0055, -57.5426];

    // Filter only places with valid coordinates
    const validPlaces = places.filter(p => typeof p.lat === 'number' && typeof p.lng === 'number');

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

            {validPlaces.map((place) => (
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
