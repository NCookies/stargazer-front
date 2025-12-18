"use client"

// src/components/MapSelector.tsx
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import type { LatLngExpression } from 'leaflet';

// 📌 Leaflet 마커 아이콘 깨짐 방지 코드 (필수!)
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: typeof icon === 'string' ? icon : icon.src,
    shadowUrl: typeof iconShadow === 'string' ? iconShadow : iconShadow.src,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

interface Position {
    lat: number;
    lon: number;
}

interface LocationMarkerProps {
    position: Position | null;
    setPosition: (position: Position) => void;
    setLocationName: (name: string) => void;
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
            setLocationName(`위도: ${lat.toFixed(4)}, 경도: ${lng.toFixed(4)}`);
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
    setLocationName: (name: string) => void;
}

export default function MapSelector({ lat, lon, setLat, setLon, setLocationName }: MapSelectorProps) {
    // 초기 위치 (서울)
    const center: Position = { lat: lat || 37.5665, lon: lon || 126.9780 };

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