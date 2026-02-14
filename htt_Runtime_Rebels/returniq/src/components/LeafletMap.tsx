'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default Leaflet marker icons not loading in Next.js
const iconUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png';
const iconRetinaUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png';
const shadowUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png';

const customIcon = L.icon({
    iconUrl,
    iconRetinaUrl,
    shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

interface LeafletMapProps {
    center: { lat: number; lng: number };
    zoom?: number;
    markers?: { lat: number; lng: number; label: string; icon?: string }[];
    userLocation?: { lat: number; lng: number };
}

export default function LeafletMap({ center, zoom = 13, markers = [], userLocation }: LeafletMapProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return <div style={{ height: '100%', width: '100%', background: '#e5e7eb' }} />;

    return (
        <MapContainer center={[center.lat, center.lng]} zoom={zoom} style={{ height: '100%', width: '100%' }}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* User Location */}
            {userLocation && (
                <>
                    <Marker position={[userLocation.lat, userLocation.lng]} icon={customIcon}>
                        <Popup>Your Location</Popup>
                    </Marker>
                    <Circle center={[userLocation.lat, userLocation.lng]} radius={500} pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.1 }} />
                </>
            )}

            {/* Meetup Points */}
            {markers.map((m, i) => (
                <Marker key={i} position={[m.lat, m.lng]} icon={customIcon}>
                    <Popup>{m.label}</Popup>
                </Marker>
            ))}
        </MapContainer>
    );
}
