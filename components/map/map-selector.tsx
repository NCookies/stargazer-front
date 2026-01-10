"use client"

import { useEffect, useState, useCallback, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Loader2, Star, Car, ParkingCircle, UtensilsCrossed, MapPin, Crosshair, Sparkles, Maximize2, Minimize2 } from 'lucide-react'
import { useMapProvider } from './map-provider'
import type { PlaceSearchResult, MapPosition } from '@/lib/map/types'
import type { StargazingSpot, CommonResponse } from '@/types/api'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface MapSelectorProps {
  lat: number
  lon: number
  setLat: (lat: number) => void
  setLon: (lon: number) => void
  setLocationName?: (name: string) => void
}

export default function MapSelector({
  lat,
  lon,
  setLat,
  setLon,
  setLocationName,
}: MapSelectorProps) {
  const { mapProvider, isReady } = useMapProvider()
  const containerRef = useRef<HTMLDivElement>(null)
  const containerIdRef = useRef<string>(`map-container-${Date.now()}`)
  const markerIdRef = useRef<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [isInitializing, setIsInitializing] = useState(false)

  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<PlaceSearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)

  const [initError, setInitError] = useState<string | null>(null)

  // 스팟 관련 상태
  const [spots, setSpots] = useState<StargazingSpot[]>([])
  const [isLoadingSpots, setIsLoadingSpots] = useState(false)
  const [spotMarkers, setSpotMarkers] = useState<Map<number, string>>(new Map()) // spotId -> markerId
  const [selectedSpot, setSelectedSpot] = useState<StargazingSpot | null>(null)
  const [openSpotId, setOpenSpotId] = useState<number | null>(null)

  // 현재 위치 관련 상태
  const [isGettingLocation, setIsGettingLocation] = useState(false)

  // 명소 찾기 관련 상태
  const [isSpotSearchDialogOpen, setIsSpotSearchDialogOpen] = useState(false)
  const [searchRadius, setSearchRadius] = useState<number>(100) // km
  const [isSpotVisible, setIsSpotVisible] = useState(true)
  const [isSearchingSpots, setIsSearchingSpots] = useState(false)

  // 지도 크기 토글 상태
  const [isMapExpanded, setIsMapExpanded] = useState(false)

  // 지도 초기화
  useEffect(() => {
    console.log('[MapSelector] 지도 초기화 useEffect 실행:', {
      isReady,
      hasMapProvider: !!mapProvider,
      isInitialized,
      isInitializing,
      hasContainer: !!containerRef.current,
    })

    if (!isReady || !mapProvider || isInitialized || isInitializing) {
      console.log('[MapSelector] 초기화 조건 불만족, 리턴:', {
        isReady,
        hasMapProvider: !!mapProvider,
        isInitialized,
        isInitializing,
      })
      return
    }

    // 컨테이너가 마운트될 때까지 대기
    let retryCount = 0
    const maxRetries = 50 // 최대 50번 시도 (약 3초)

    const checkContainer = () => {
      const container = containerRef.current
      console.log('[MapSelector] 컨테이너 확인:', {
        retryCount,
        hasContainer: !!container,
        containerId: containerIdRef.current,
      })

      if (!container) {
        retryCount++
        if (retryCount >= maxRetries) {
          console.error('[MapSelector] 컨테이너를 찾을 수 없습니다. 최대 재시도 횟수 초과.')
          setInitError('지도 컨테이너를 찾을 수 없습니다.')
          return
        }
        // 컨테이너가 아직 준비되지 않았으면 다음 프레임에서 다시 시도
        requestAnimationFrame(checkContainer)
        return
      }

      console.log('[MapSelector] 컨테이너 발견, 지도 초기화 시작')
      setIsInitializing(true)
      setInitError(null)

      console.log('[MapSelector] 지도 초기화 시작:', {
        containerId: containerIdRef.current,
        position: { lat, lng: lon },
        containerSize: {
          width: container.offsetWidth,
          height: container.offsetHeight,
        },
      })

      mapProvider
        .initialize(containerIdRef.current, { lat, lng: lon }, { zoom: 10 })
        .then(() => {
          console.log('[MapSelector] 지도 초기화 성공')
          // 초기 이벤트 핸들러 설정
          mapProvider.setEventHandlers({
            onMapClick: async (position) => {
              console.log('[MapSelector] 지도 클릭 이벤트:', position)
              // 일반 클릭: 지도 중심 이동만
              mapProvider.setCenter(position, true)
              // 스팟 정보 닫기
              setSelectedSpot(null)
              setOpenSpotId(null)
            },
            onMapRightClick: async (position) => {
              console.log('[MapSelector] 지도 우클릭 이벤트:', position)
              // 우클릭: 마커 위치 변경
              
              // 기존 마커 제거
              if (markerIdRef.current) {
                mapProvider.removeMarker(markerIdRef.current)
                markerIdRef.current = null
              }
              
              // 새 마커 추가
              markerIdRef.current = mapProvider.setMarker(position)
              
              // 좌표 업데이트
              setLat(position.lat)
              setLon(position.lng)

              // 주소 변환
              const address = await mapProvider.getAddressFromPosition(position)
              setLocationName?.(address)
            },
          })

          // 초기 마커 추가
          markerIdRef.current = mapProvider.setMarker({ lat, lng: lon })
          setIsInitialized(true)
          setInitError(null)
          
          // 스팟 데이터 로드
          loadSpots()
        })
        .catch((error) => {
          const errorMessage = error?.message || '지도 초기화 중 오류가 발생했습니다.'
          console.error('[MapSelector] 지도 초기화 오류:', error)
          setInitError(errorMessage)
        })
        .finally(() => {
          setIsInitializing(false)
        })
    }

    // 컨테이너 확인 시작
    checkContainer()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady, mapProvider, isInitialized, isInitializing])

  // 좌표 변경 시 지도 및 마커 업데이트
  useEffect(() => {
    if (!isInitialized || !mapProvider) return

    mapProvider.setCenter({ lat, lng: lon }, true)

    // 사용자 지정 마커 업데이트 (스팟 마커는 유지)
    if (markerIdRef.current) {
      mapProvider.removeMarker(markerIdRef.current)
    }
    markerIdRef.current = mapProvider.setMarker({ lat, lng: lon })
  }, [lat, lon, isInitialized, mapProvider])

  // 지도 크기 변경 시 리레이아웃
  useEffect(() => {
    if (!isInitialized || !mapProvider) return

    // 지도 크기 변경 애니메이션 완료 후 리레이아웃
    const timer = setTimeout(() => {
      if (mapProvider.relayout) {
        mapProvider.relayout()
      }
    }, 350) // transition duration 300ms + 여유 시간

    return () => clearTimeout(timer)
  }, [isMapExpanded, isInitialized, mapProvider])

  // 스팟 데이터 로드
  const loadSpots = useCallback(async (radius?: number) => {
    setIsLoadingSpots(true)
    try {
      let url = '/api/v1/spots'
      
      // 반경이 지정되고 0보다 큰 경우 쿼리 파라미터 추가
      if (radius !== undefined && radius > 0) {
        const params = new URLSearchParams({
          lat: lat.toString(),
          lon: lon.toString(),
          radius: radius.toString(),
        })
        url += `?${params.toString()}`
      }
      // radius가 0이거나 undefined면 전체 조회 (파라미터 없음)
      
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`스팟 데이터를 불러올 수 없습니다: ${response.status}`)
      }
      
      const result: CommonResponse<StargazingSpot[]> = await response.json()
      if (result.success && result.data) {
        setSpots(result.data)
      }
    } catch (error) {
      console.error('스팟 데이터 로드 오류:', error)
    } finally {
      setIsLoadingSpots(false)
    }
  }, [lat, lon])

  // 스팟 마커 아이콘 생성 (SVG를 base64로 변환)
  const createSpotMarkerImage = (): string => {
    const svg = `<svg width="30" height="30" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
      <circle cx="15" cy="15" r="13" fill="#f97316" stroke="#fff" stroke-width="1.5"/>
      <path d="M15 6 L17.25 11.25 L22.5 12 L18.75 15.75 L20.25 21 L15 18 L9.75 21 L11.25 15.75 L7.5 12 L12.75 11.25 Z" fill="#fff"/>
    </svg>`.trim()
    // SVG를 URL 인코딩하여 사용 (base64 대신)
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg)
  }

  // 스팟 마커 표시
  useEffect(() => {
    if (!isInitialized || !mapProvider) return

    // 명소 표시가 꺼져있으면 마커 제거
    if (!isSpotVisible || spots.length === 0) {
      mapProvider.clearMarkersByType?.('spot')
      setSpotMarkers(new Map())
      return
    }

    // 기존 스팟 마커 제거
    mapProvider.clearMarkersByType?.('spot')

    // 스팟 마커 이미지 생성
    const spotMarkerImageSrc = createSpotMarkerImage()
    const markerImageSize = { width: 30, height: 30 }
    const markerImageOffset = { x: 15, y: 15 }

    // 각 스팟에 마커 추가
    const newSpotMarkers = new Map<number, string>()
    spots.forEach((spot) => {
      const markerId = mapProvider.addMarker(
        { lat: spot.latitude, lng: spot.longitude },
        {
          type: 'spot',
          data: spot,
          image: {
            src: spotMarkerImageSrc,
            size: markerImageSize,
            options: { offset: markerImageOffset },
          },
          clickable: true,
          zIndex: 1, // 사용자 마커보다 낮은 z-index
        }
      )
      newSpotMarkers.set(spot.id, markerId)
    })

    setSpotMarkers(newSpotMarkers)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitialized, mapProvider, spots, isSpotVisible])

  // 마커 클릭 이벤트 핸들러 설정 (기존 핸들러 보존)
  useEffect(() => {
    if (!isInitialized || !mapProvider) return

    // 스팟이 변경될 때마다 마커 클릭 핸들러 업데이트
    mapProvider.setEventHandlers({
      onMarkerClick: (markerId: string, data?: any) => {
        if (data && typeof data.id === 'number') {
          const spot = spots.find((s) => s.id === data.id)
          if (spot) {
            // 지도 중심 이동
            mapProvider.setCenter({ lat: spot.latitude, lng: spot.longitude }, true)
            // 스팟 정보 표시
            setSelectedSpot(spot)
            setOpenSpotId(spot.id)
          }
        }
      },
    })
  }, [isInitialized, mapProvider, spots])

  // 현재 위치로 이동
  const moveToCurrentLocation = useCallback(async () => {
    if (!mapProvider || !isInitialized) return

    setIsGettingLocation(true)
    try {
      // Geolocation API 사용
      if (!navigator.geolocation) {
        alert('이 브라우저는 위치 서비스를 지원하지 않습니다.')
        return
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const currentLat = position.coords.latitude
          const currentLon = position.coords.longitude

          // 지도 중심 이동
          mapProvider.setCenter({ lat: currentLat, lng: currentLon }, true)

          // 사용자 지정 마커 위치 변경
          if (markerIdRef.current) {
            mapProvider.removeMarker(markerIdRef.current)
            markerIdRef.current = null
          }
          markerIdRef.current = mapProvider.setMarker({ lat: currentLat, lng: currentLon })

          // 좌표 업데이트
          setLat(currentLat)
          setLon(currentLon)

          // 주소 변환
          const address = await mapProvider.getAddressFromPosition({
            lat: currentLat,
            lng: currentLon,
          })
          setLocationName?.(address)
        },
        (error) => {
          console.error('위치 정보 가져오기 오류:', error)
          let errorMessage = '위치 정보를 가져올 수 없습니다.'
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = '위치 정보 접근이 거부되었습니다. 브라우저 설정에서 위치 권한을 허용해주세요.'
              break
            case error.POSITION_UNAVAILABLE:
              errorMessage = '위치 정보를 사용할 수 없습니다.'
              break
            case error.TIMEOUT:
              errorMessage = '위치 정보 요청 시간이 초과되었습니다.'
              break
          }
          alert(errorMessage)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      )
    } catch (error) {
      console.error('현재 위치 이동 오류:', error)
      alert('현재 위치로 이동하는 중 오류가 발생했습니다.')
    } finally {
      setIsGettingLocation(false)
    }
  }, [mapProvider, isInitialized, setLat, setLon, setLocationName])

  // 장소 검색
  const searchLocation = useCallback(
    async (query: string) => {
      if (!query.trim() || !mapProvider) {
        setSearchResults([])
        setShowResults(false)
        return
      }

      setIsSearching(true)
      try {
        const results = await mapProvider.searchPlaces(query)
        setSearchResults(results)
        setShowResults(true)
      } catch (error) {
        console.error('장소 검색 오류:', error)
        setSearchResults([])
        setShowResults(false)
      } finally {
        setIsSearching(false)
      }
    },
    [mapProvider]
  )

  // 검색 결과 선택 핸들러
  const handleSelectResult = async (result: PlaceSearchResult) => {
    setLat(result.position.lat)
    setLon(result.position.lng)
    setSearchQuery(result.name)
    setShowResults(false)

    // 주소 표시
    const address = await mapProvider?.getAddressFromPosition(result.position)
    setLocationName?.(address || result.address)
  }

  // 검색 입력 핸들러
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    searchLocation(searchQuery)
  }

  // 검색어 디바운싱
  useEffect(() => {
    if (!searchQuery.trim()) {
      setShowResults(false)
      return
    }

    const timeoutId = setTimeout(() => {
      searchLocation(searchQuery)
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [searchQuery, searchLocation])

  // 외부 클릭 시 검색 결과 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('.search-container')) {
        setShowResults(false)
      }
    }

    if (showResults) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [showResults])

  // 디버깅: 상태 확인
  useEffect(() => {
    console.log('[MapSelector] 상태 확인:', {
      isReady,
      hasMapProvider: !!mapProvider,
      isInitialized,
      isInitializing,
    })
  }, [isReady, mapProvider, isInitialized, isInitializing])

  if (!isReady || !mapProvider) {
    console.log('[MapSelector] Provider 대기 중:', { isReady, hasMapProvider: !!mapProvider })
    return (
      <div className="w-full h-96 rounded-lg overflow-hidden border border-gray-700 relative z-0 bg-secondary/30 flex items-center justify-center">
        <p className="text-muted-foreground">지도 제공자를 초기화하는 중...</p>
      </div>
    )
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
                  setShowResults(true)
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
                  key={result.id}
                  type="button"
                  onClick={() => handleSelectResult(result)}
                  className="w-full text-left px-4 py-3 hover:bg-accent hover:text-accent-foreground transition-colors border-b border-border last:border-b-0"
                >
                  <div className="font-medium text-sm">{result.name}</div>
                  {result.address && (
                    <div className="text-xs text-muted-foreground mt-1">{result.address}</div>
                  )}
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
      <div className={`w-full rounded-lg overflow-hidden border border-gray-700 relative z-0 transition-all duration-300 ${isMapExpanded ? 'h-[600px]' : 'h-96'}`}>
        {/* 지도 크기 토글 버튼 */}
        {isInitialized && (
          <div className="absolute top-4 right-4 z-20">
            <Button
              variant="default"
              size="icon"
              className="rounded-full w-8 h-8 shadow-lg cursor-pointer bg-background/80 backdrop-blur-sm hover:bg-background"
              onClick={() => setIsMapExpanded(!isMapExpanded)}
              title={isMapExpanded ? '지도 축소' : '지도 확대'}
            >
              {isMapExpanded ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </Button>
          </div>
        )}
        {/* 컨테이너는 항상 렌더링 (초기화를 위해 필요) */}
        <div
          ref={containerRef}
          id={containerIdRef.current}
          className="w-full h-full"
          style={{ minHeight: '256px', width: '100%', height: '100%' }}
          onContextMenu={(e) => {
            // 기본 우클릭 메뉴 방지
            e.preventDefault()
          }}
        />
        {/* 로딩 오버레이 */}
        {(!isInitialized || isInitializing) && (
          <div className="absolute inset-0 bg-secondary/30 flex flex-col items-center justify-center gap-2 p-4 z-10">
            {initError ? (
              <>
                <p className="text-destructive font-medium text-sm">지도 로드 실패</p>
                <p className="text-muted-foreground text-xs text-center max-w-md">{initError}</p>
                <p className="text-muted-foreground text-xs text-center mt-2">
                  브라우저 콘솔(F12)에서 자세한 오류를 확인하세요.
                </p>
              </>
            ) : (
              <p className="text-muted-foreground">지도를 불러오는 중...</p>
            )}
          </div>
        )}
        {/* 명소 찾기 및 현재 위치로 이동 버튼 */}
        {isInitialized && (
          <div className="absolute bottom-4 right-4 z-20 flex flex-col gap-2">
            {/* 명소 찾기 버튼 */}
            <Dialog open={isSpotSearchDialogOpen} onOpenChange={setIsSpotSearchDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="default"
                  size="icon"
                  className="rounded-full w-10 h-10 shadow-lg cursor-pointer"
                  title="명소 찾기"
                >
                  <Sparkles className="w-5 h-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>명소 찾기 설정</DialogTitle>
                  <DialogDescription>
                    파란색 마커 기준 반경 내의 명소를 찾거나 전체 명소를 조회할 수 있습니다.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  {/* 반경 설정 */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="radius" className="text-sm font-medium">
                        검색 반경
                      </Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="radius"
                          type="number"
                          min={20}
                          max={500}
                          value={searchRadius}
                          onChange={(e) => {
                            const value = parseInt(e.target.value)
                            if (!isNaN(value) && value >= 20 && value <= 500) {
                              setSearchRadius(value)
                            }
                          }}
                          className="w-20 h-8 text-sm"
                        />
                        <span className="text-sm text-muted-foreground">km</span>
                      </div>
                    </div>
                    <Slider
                      value={[searchRadius]}
                      onValueChange={(value) => setSearchRadius(value[0])}
                      min={20}
                      max={500}
                      step={10}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>20km</span>
                      <span>500km</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      반경을 설정하면 파란색 마커 기준 해당 반경 내의 명소만 표시됩니다.
                    </p>
                  </div>

                  {/* 명소 표시 토글 */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="spot-visibility" className="text-sm font-medium">
                        명소 아이콘 표시
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        지도에 명소 마커를 표시하거나 숨깁니다.
                      </p>
                    </div>
                    <Switch
                      id="spot-visibility"
                      checked={isSpotVisible}
                      onCheckedChange={setIsSpotVisible}
                      className="data-[state=unchecked]:border-2 data-[state=unchecked]:border-border data-[state=unchecked]:bg-muted data-[state=unchecked]:dark:bg-muted/70"
                    />
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={async () => {
                      // 전체 명소 조회 (반경 없음)
                      setIsSearchingSpots(true)
                      try {
                        await loadSpots()
                        setIsSpotSearchDialogOpen(false)
                      } finally {
                        setIsSearchingSpots(false)
                      }
                    }}
                    disabled={isSearchingSpots}
                  >
                    {isSearchingSpots ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        조회 중...
                      </>
                    ) : (
                      '전체 조회'
                    )}
                  </Button>
                  <Button
                    onClick={async () => {
                      // 반경 내 명소 조회
                      setIsSearchingSpots(true)
                      try {
                        await loadSpots(searchRadius)
                        setIsSpotSearchDialogOpen(false)
                      } finally {
                        setIsSearchingSpots(false)
                      }
                    }}
                    disabled={isSearchingSpots}
                  >
                    {isSearchingSpots ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        검색 중...
                      </>
                    ) : (
                      '반경 내 검색'
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* 현재 위치로 이동 버튼 */}
            <Button
              variant="default"
              size="icon"
              className="rounded-full w-10 h-10 shadow-lg cursor-pointer"
              onClick={moveToCurrentLocation}
              disabled={isGettingLocation}
              title="현재 위치로 이동"
            >
              {isGettingLocation ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Crosshair className="w-5 h-5" />
              )}
            </Button>
          </div>
        )}
        {/* 스팟 마커 클릭 시 표시되는 상세 정보 카드 */}
        {selectedSpot && openSpotId === selectedSpot.id && (
          <div className="absolute top-4 right-4 z-20 max-w-sm w-full">
            <Card className="border-border/50 bg-card/95 backdrop-blur-sm shadow-lg">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Star className="w-5 h-5 text-primary" />
                      {selectedSpot.title}
                    </CardTitle>
                    <CardDescription className="mt-1 text-xs">
                      {selectedSpot.address}
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => {
                      setSelectedSpot(null)
                      setOpenSpotId(null)
                    }}
                  >
                    ×
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">{selectedSpot.description}</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="text-xs">
                    Bortle {selectedSpot.bortleScale}
                  </Badge>
                  {selectedSpot.isParkingAvailable && (
                    <Badge variant="outline" className="text-xs flex items-center gap-1">
                      <ParkingCircle className="w-3 h-3" />
                      주차 가능
                    </Badge>
                  )}
                  {selectedSpot.isRestroomAvailable && (
                    <Badge variant="outline" className="text-xs flex items-center gap-1">
                      <UtensilsCrossed className="w-3 h-3" />
                      화장실
                    </Badge>
                  )}
                  {selectedSpot.isCarAccess && (
                    <Badge variant="outline" className="text-xs flex items-center gap-1">
                      <Car className="w-3 h-3" />
                      차량 접근
                    </Badge>
                  )}
                </div>
                <Button
                  variant="default"
                  className="w-full mt-2"
                  onClick={async () => {
                    if (selectedSpot) {
                      // 좌표 업데이트
                      setLat(selectedSpot.latitude)
                      setLon(selectedSpot.longitude)
                      
                      // 사용자 지정 마커 위치 변경
                      if (markerIdRef.current) {
                        mapProvider.removeMarker(markerIdRef.current)
                        markerIdRef.current = null
                      }
                      markerIdRef.current = mapProvider.setMarker({
                        lat: selectedSpot.latitude,
                        lng: selectedSpot.longitude,
                      })
                      
                      // 주소 업데이트
                      const address = await mapProvider.getAddressFromPosition({
                        lat: selectedSpot.latitude,
                        lng: selectedSpot.longitude,
                      })
                      setLocationName?.(address || selectedSpot.address)
                      
                      // 카드 닫기
                      setSelectedSpot(null)
                      setOpenSpotId(null)
                    }
                  }}
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  이 위치로 설정
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

