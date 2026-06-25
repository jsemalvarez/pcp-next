"use client";

import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet's default icon issue with Next.js/bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LocationPickerMapProps {
  lat: number;
  lng: number;
  onPositionChange: (lat: number, lng: number) => void;
}

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 15);
  }, [center, map]);
  return null;
}

function MapClickHandler({ setPosition, onPositionChange }: any) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);
      onPositionChange(lat, lng);
    }
  });
  return null;
}

export default function LocationPickerMap({ lat, lng, onPositionChange }: LocationPickerMapProps) {
  const defaultLat = -38.0055;
  const defaultLng = -57.5426;
  const initialLat = lat || defaultLat;
  const initialLng = lng || defaultLng;
  
  const [position, setPosition] = useState<[number, number]>([initialLat, initialLng]);
  const markerRef = useRef<L.Marker>(null);

  useEffect(() => {
    if (lat && lng && (lat !== position[0] || lng !== position[1])) {
      setPosition([lat, lng]);
    }
  }, [lat, lng]);

  const eventHandlers = {
    dragend() {
      const marker = markerRef.current;
      if (marker != null) {
        const { lat, lng } = marker.getLatLng();
        setPosition([lat, lng]);
        onPositionChange(lat, lng);
      }
    },
  };

  return (
    <MapContainer 
      center={position} 
      zoom={14} 
      style={{ height: "350px", width: "100%", borderRadius: "0.75rem", zIndex: 10 }}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapUpdater center={position} />
      <MapClickHandler setPosition={setPosition} onPositionChange={onPositionChange} />
      <Marker 
        draggable={true} 
        eventHandlers={eventHandlers} 
        position={position} 
        ref={markerRef} 
      />
    </MapContainer>
  );
}
