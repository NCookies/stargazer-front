"use client"

import { useEffect, useState, useCallback, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Loader2 } from 'lucide-react'
import { useMapProvider } from './map-provider'
import type { PlaceSearchResult, MapPosition } from '@/lib/map/types'

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
          // 이벤트 핸들러 설정
          mapProvider.setEventHandlers({
            onMapClick: async (position) => {
              console.log('[MapSelector] 지도 클릭 이벤트:', position)
              // 일반 클릭: 지도 중심 이동만
              mapProvider.setCenter(position, true)
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

    // 마커 업데이트
    if (markerIdRef.current) {
      mapProvider.removeMarker(markerIdRef.current)
    }
    markerIdRef.current = mapProvider.setMarker({ lat, lng: lon })
  }, [lat, lon, isInitialized, mapProvider])

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
      <div className="w-full h-64 rounded-lg overflow-hidden border border-gray-700 relative z-0 bg-secondary/30 flex items-center justify-center">
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
      <div className="w-full h-64 rounded-lg overflow-hidden border border-gray-700 relative z-0">
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
      </div>
    </div>
  )
}

