'use client';

import { GoogleMap as GMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { useState, useCallback } from 'react';

const containerStyle = {
    width: '100%',
    height: '100%'
};

const defaultCenter = {
    lat: 21.1702,
    lng: 72.8311
};

interface GoogleMapProps {
    center: { lat: number; lng: number };
    zoom?: number;
    markers?: { lat: number; lng: number; label: string; icon?: string }[];
    userLocation?: { lat: number; lng: number };
}

export default function GoogleMap({ center, zoom = 13, markers = [], userLocation }: GoogleMapProps) {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''
    });

    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [selectedMarker, setSelectedMarker] = useState<{ lat: number; lng: number; label: string } | null>(null);

    const onLoad = useCallback(function callback(map: google.maps.Map) {
        setMap(map);
    }, []);

    const onUnmount = useCallback(function callback(map: google.maps.Map) {
        setMap(null);
    }, []);

    if (!isLoaded) return <div style={{ height: '100%', width: '100%', background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading Google Maps...</div>;

    return (
        <GMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={zoom}
            onLoad={onLoad}
            onUnmount={onUnmount}
            options={{
                disableDefaultUI: true,
                zoomControl: true,
                streetViewControl: false,
                mapTypeControl: false,
            }}
        >
            {/* User Location */}
            {userLocation && (
                <Marker
                    position={userLocation}
                    icon={{
                        path: google.maps.SymbolPath.CIRCLE,
                        scale: 10,
                        fillColor: "#4285F4",
                        fillOpacity: 1,
                        strokeWeight: 2,
                        strokeColor: "white",
                    }}
                    title="Your Location"
                />
            )}

            {/* Markers */}
            {markers.map((m, i) => (
                <Marker
                    key={i}
                    position={{ lat: m.lat, lng: m.lng }}
                    onClick={() => setSelectedMarker(m)}
                    title={m.label}
                />
            ))}

            {selectedMarker && (
                <InfoWindow
                    position={{ lat: selectedMarker.lat, lng: selectedMarker.lng }}
                    onCloseClick={() => setSelectedMarker(null)}
                >
                    <div>
                        <div style={{ fontWeight: 600, fontSize: '14px' }}>{selectedMarker.label}</div>
                    </div>
                </InfoWindow>
            )}
        </GMap>
    );
}
