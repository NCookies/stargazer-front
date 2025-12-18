"use client"

// src/components/MapSelector.tsx
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import type { LatLngExpression } from 'leaflet';

// 📌 Leaflet 마커 아이콘 깨짐 방지 코드 (필수!) - 클라이언트 사이드에서만 실행
let iconInitialized = false;
const initializeLeafletIcon = () => {
    if (typeof window === 'undefined' || iconInitialized) return;
    
    try {
        // 기본 Leaflet 아이콘 경로 사용
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
            iconShadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41]
        });
        iconInitialized = true;
    } catch (error) {
        console.warn('Leaflet 아이콘 초기화 실패:', error);
    }
};

interface Position {
    lat: number;
    lon: number;
}

interface LocationMarkerProps {
    position: Position | null;
    setPosition: (position: Position) => void;
    setLocationName?: (name: string) => void;
}

// 클릭 이벤트 핸들러
function LocationMarker({ position, setPosition, setLocationName }: LocationMarkerProps) {
    const map = useMap();
    
    useMapEvents({
        click(e: L.LeafletMouseEvent) {
            const { lat, lng } = e.latlng;
            setPosition({ lat, lon: lng });
            map.flyTo(e.latlng, map.getZoom()); // 클릭한 곳으로 부드럽게 이동
            // (선택) 여기에 나중에 "좌표 -> 주소 변환" API를 넣을 수 있음
            setLocationName?.(`위도: ${lat.toFixed(4)}, 경도: ${lng.toFixed(4)}`);
        },
    });

    if (position === null) {
        return null;
    }

    return <Marker position={[position.lat, position.lon] as LatLngExpression} />;
}

interface MapSelectorProps {
    lat: number;
    lon: number;
    setLat: (lat: number) => void;
    setLon: (lon: number) => void;
    setLocationName?: (name: string) => void;
}

export default function MapSelector({ lat, lon, setLat, setLon, setLocationName }: MapSelectorProps) {
    // 초기 위치 (서울)
    const center: Position = { lat: lat || 37.5665, lon: lon || 126.9780 };
    const [isMounted, setIsMounted] = useState(false);

    // 클라이언트 사이드에서만 렌더링되도록 처리 (SSR 에러 방지)
    useEffect(() => {
        if (typeof window !== 'undefined') {
            initializeLeafletIcon();
            setIsMounted(true);
        }
    }, []);

    if (!isMounted || typeof window === 'undefined') {
        return (
            <div className="w-full h-64 rounded-lg overflow-hidden border border-gray-700 relative z-0 bg-secondary/30 flex items-center justify-center">
                <p className="text-muted-foreground">지도를 불러오는 중...</p>
            </div>
        );
    }

    return (
        <div className="w-full h-64 rounded-lg overflow-hidden border border-gray-700 relative z-0">
            <MapContainer 
                center={[center.lat, center.lon]} 
                zoom={10} 
                scrollWheelZoom={true} 
                style={{ height: '100%', width: '100%' }}
            >
                {/* 지도 타일 (OpenStreetMap - 무료) */}
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker 
                    position={{ lat, lon }} 
                    setPosition={({lat, lon}) => { setLat(lat); setLon(lon); }} 
                    setLocationName={setLocationName}
                />
            </MapContainer>
        </div>
    );
}