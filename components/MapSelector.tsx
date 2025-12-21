"use client"

// src/components/MapSelector.tsx
import { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import type { LatLngExpression } from 'leaflet';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2 } from 'lucide-react';

// 📌 Leaflet 마커 아이콘 깨짐 방지 코드 (필수!) - 클라이언트 사이드에서만 실행
let defaultIcon: L.Icon | null = null;

const getDefaultIcon = (): L.Icon => {
    if (typeof window === 'undefined') {
        // SSR 환경에서는 더미 아이콘 반환
        return new L.Icon({
            iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
            iconShadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        });
    }
    
    if (!defaultIcon) {
        // CDN에서 직접 로드하는 아이콘 생성
        defaultIcon = new L.Icon({
            iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
            iconShadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        });
    }
    
    return defaultIcon;
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

    return <Marker position={[position.lat, position.lon] as LatLngExpression} icon={getDefaultIcon()} />;
}

interface SearchResult {
    display_name: string;
    lat: string;
    lon: string;
    place_id: number;
}

interface MapSelectorProps {
    lat: number;
    lon: number;
    setLat: (lat: number) => void;
    setLon: (lon: number) => void;
    setLocationName?: (name: string) => void;
}

// 지도 이동을 위한 컴포넌트
function MapController({ lat, lon }: { lat: number; lon: number }) {
    const map = useMap();
    
    useEffect(() => {
        map.flyTo([lat, lon], map.getZoom(), {
            duration: 0.5
        });
    }, [lat, lon, map]);
    
    return null;
}

export default function MapSelector({ lat, lon, setLat, setLon, setLocationName }: MapSelectorProps) {
    // 초기 위치 (서울)
    const center: Position = { lat: lat || 37.5665, lon: lon || 126.9780 };
    const [isMounted, setIsMounted] = useState(false);
    
    // 검색 관련 상태
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);

    // 클라이언트 사이드에서만 렌더링되도록 처리 (SSR 에러 방지)
    useEffect(() => {
        if (typeof window !== 'undefined') {
            // 아이콘 초기화 (한 번만 실행)
            getDefaultIcon();
            setIsMounted(true);
        }
    }, []);

    // 장소 검색 함수
    const searchLocation = useCallback(async (query: string) => {
        if (!query.trim()) {
            setSearchResults([]);
            setShowResults(false);
            return;
        }

        setIsSearching(true);
        try {
            // Nominatim API 사용 (무료, API 키 불필요)
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&accept-language=ko`,
                {
                    headers: {
                        'User-Agent': 'Stargazer App' // Nominatim은 User-Agent 필수
                    }
                }
            );
            
            if (!response.ok) {
                throw new Error('검색에 실패했습니다.');
            }
            
            const data: SearchResult[] = await response.json();
            setSearchResults(data);
            setShowResults(true);
        } catch (error) {
            console.error('장소 검색 오류:', error);
            setSearchResults([]);
            setShowResults(false);
        } finally {
            setIsSearching(false);
        }
    }, []);

    // 검색 결과 선택 핸들러
    const handleSelectResult = (result: SearchResult) => {
        const newLat = parseFloat(result.lat);
        const newLon = parseFloat(result.lon);
        
        setLat(newLat);
        setLon(newLon);
        setSearchQuery(result.display_name);
        setShowResults(false);
        setLocationName?.(result.display_name);
    };

    // 검색 입력 핸들러
    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        searchLocation(searchQuery);
    };

    // 검색어 디바운싱
    useEffect(() => {
        if (!searchQuery.trim()) {
            setShowResults(false);
            return;
        }

        const timeoutId = setTimeout(() => {
            searchLocation(searchQuery);
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchQuery, searchLocation]);

    // 외부 클릭 시 검색 결과 닫기
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (!target.closest('.search-container')) {
                setShowResults(false);
            }
        };

        if (showResults) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }
    }, [showResults]);

    if (!isMounted || typeof window === 'undefined') {
        return (
            <div className="w-full h-64 rounded-lg overflow-hidden border border-gray-700 relative z-0 bg-secondary/30 flex items-center justify-center">
                <p className="text-muted-foreground">지도를 불러오는 중...</p>
            </div>
        );
    }

    return (
        <div className="w-full space-y-3">
            {/* 검색 입력 필드 */}
            <form onSubmit={handleSearchSubmit} className="relative search-container">
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="장소 검색 (예: 서울시청, 제주도, 부산 해운대...)"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => {
                                if (searchResults.length > 0) {
                                    setShowResults(true);
                                }
                            }}
                            className="pl-9"
                        />
                    </div>
                    <Button 
                        type="submit" 
                        disabled={isSearching || !searchQuery.trim()}
                        variant="default"
                    >
                        {isSearching ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Search className="w-4 h-4" />
                        )}
                    </Button>
                </div>
                
                {/* 검색 결과 목록 */}
                {showResults && (
                    <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-md shadow-lg max-h-60 overflow-y-auto">
                        {searchResults.length > 0 ? (
                            searchResults.map((result) => (
                                <button
                                    key={result.place_id}
                                    type="button"
                                    onClick={() => handleSelectResult(result)}
                                    className="w-full text-left px-4 py-3 hover:bg-accent hover:text-accent-foreground transition-colors border-b border-border last:border-b-0"
                                >
                                    <div className="font-medium text-sm">{result.display_name}</div>
                                </button>
                            ))
                        ) : (
                            <div className="px-4 py-3 text-sm text-muted-foreground text-center">
                                검색 결과가 없습니다.
                            </div>
                        )}
                    </div>
                )}
            </form>

            {/* 지도 */}
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
                    <MapController lat={lat} lon={lon} />
                    <LocationMarker 
                        position={{ lat, lon }} 
                        setPosition={({lat, lon}) => { 
                            setLat(lat); 
                            setLon(lon);
                            setShowResults(false);
                        }} 
                        setLocationName={setLocationName}
                    />
                </MapContainer>
            </div>
        </div>
    );
}