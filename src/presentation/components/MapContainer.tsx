"use client";

import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';
import { Place, PlaceCategory } from '@/domain/entities/Place';
import { getCategoryLabel } from '@/presentation/utils/category';
import { ICONS_TYPES } from '@/presentation/constants/icons-types';
import { COLORS_BY_CATEGORIES } from '@/presentation/constants/categories';
import { getCustomSvgIcon } from '@/presentation/utils/getCustomSvgIcon';
import { createSvgIcon } from '@/presentation/utils/createSvgIcon';
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
        const container = map.getContainer();
        if (!container) return;

        const resizeObserver = new ResizeObserver(() => {
            // Trigger size invalidation when the container size or display state changes
            map.invalidateSize();
        });

        resizeObserver.observe(container);

        // Initial invalidation
        map.invalidateSize();
        const timer = setTimeout(() => {
            map.invalidateSize();
        }, 400);

        return () => {
            resizeObserver.disconnect();
            clearTimeout(timer);
        };
    }, [map]);

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

            {validPlaces.map((place) => {
                const placeType = place.iconType || 'PLAY_ROOM';
                const svgIconType = ICONS_TYPES[ placeType as keyof typeof ICONS_TYPES ];
                
                const bgColor = place.bgColor ?? COLORS_BY_CATEGORIES.ENTERTAINMENT ?? '#FFA500';
                const icon = (place.hasCustomIcon)
                    ? getCustomSvgIcon({ imageId: place.photoUrl ?? '' })
                    : createSvgIcon({ bgColor, svgIconType: svgIconType ?? '' });

                return (
                    <Marker
                        key={place.id}
                        position={[place.lat, place.lng]}
                        icon={icon}
                        eventHandlers={{
                            click: () => onSelectPlace(place)
                        }}
                    />
                );
            })}
        </MapContainer>
    );
}
