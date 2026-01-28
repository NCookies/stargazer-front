"use client"

import { useEffect, useState, useCallback, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Loader2, Star, Car, ParkingCircle, UtensilsCrossed, MapPin, Crosshair, Sparkles, Maximize2, Minimize2, Bookmark } from 'lucide-react'
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
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import { 
  createSpotMarkerImageUrl, 
  getSpotMarkerImageSize, 
  getSpotMarkerImageOffset,
  createBookmarkMarkerImageUrl,
  getBookmarkMarkerImageSize,
  getBookmarkMarkerImageOffset
} from '@/lib/map/marker-icons'
import { bookmarksApi } from '@/lib/api'
import { bookmarkStore } from '@/lib/store/bookmarkStore'
import { BookmarkModal } from './bookmark-modal'
import { SpotDetailModal } from './spot-detail-modal'
import { authStore } from '@/lib/store/authStore'
import { useToast } from '@/hooks/use-toast'

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
  const [selectedBookmark, setSelectedBookmark] = useState<any | null>(null)
  const [openSpotId, setOpenSpotId] = useState<number | null>(null)
  const [openBookmarkId, setOpenBookmarkId] = useState<number | null>(null)

  // 현재 위치 관련 상태
  const [isGettingLocation, setIsGettingLocation] = useState(false)

  // 명소 찾기 관련 상태
  const [isSpotSearchDialogOpen, setIsSpotSearchDialogOpen] = useState(false)
  const [searchRadius, setSearchRadius] = useState<number>(100) // km
  const [isSpotVisible, setIsSpotVisible] = useState(true)
  const [isSearchingSpots, setIsSearchingSpots] = useState(false)

  // 지도 크기 토글 상태
  const [isMapExpanded, setIsMapExpanded] = useState(false)

  // 북마크 관련 상태
  const { bookmarks, setBookmarks, addBookmark, removeBookmark, isSpotBookmarked, getBookmarkBySpotId } = bookmarkStore()
  const { isAuthenticated } = authStore()
  const [isBookmarkVisible, setIsBookmarkVisible] = useState(true)
  const [bookmarkMarkers, setBookmarkMarkers] = useState<Map<number, string>>(new Map()) // bookmarkId -> markerId
  const [isBookmarkModalOpen, setIsBookmarkModalOpen] = useState(false)
  const [bookmarkModalPosition, setBookmarkModalPosition] = useState<MapPosition | null>(null)
  const [bookmarkModalAddress, setBookmarkModalAddress] = useState('')
  const [isLoadingBookmarkAddress, setIsLoadingBookmarkAddress] = useState(false)
  const { toast } = useToast()

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
              // 북마크 모달도 닫기
              setSelectedBookmark(null)
              setOpenBookmarkId(null)
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
            onMarkerDrag: (position) => {
              console.log('[MapSelector] 마커 드래그 이벤트:', position)
              // 마커 드래그 시 좌표 업데이트
              setLat(position.lat)
              setLon(position.lng)
              
              // 주소 변환 (비동기로 처리)
              mapProvider.getAddressFromPosition(position).then((address) => {
                setLocationName?.(address)
              }).catch((error) => {
                console.error('주소 변환 오류:', error)
              })
            },
          })

          // 초기 마커 추가
          markerIdRef.current = mapProvider.setMarker({ lat, lng: lon })
          setIsInitialized(true)
          setInitError(null)
          
          // 스팟 데이터 로드
          loadSpots()
          
          // 북마크 데이터 로드 (로그인한 경우)
          if (isAuthenticated) {
            loadBookmarks()
          }
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

  // 북마크 데이터 로드
  const loadBookmarks = useCallback(async () => {
    if (!isAuthenticated) return
    
    try {
      const bookmarkList = await bookmarksApi.getBookmarkList()
      setBookmarks(bookmarkList)
    } catch (error) {
      console.error('북마크 데이터 로드 오류:', error)
      // 인증 오류인 경우 북마크 리스트를 비움
      if (error instanceof Error && error.message.includes('401')) {
        setBookmarks([])
      }
    }
  }, [isAuthenticated, setBookmarks])

  // 스팟 마커 표시
  useEffect(() => {
    if (!isInitialized || !mapProvider) return

    // 명소가 없으면 마커 제거
    if (spots.length === 0) {
      mapProvider.clearMarkersByType?.('spot')
      setSpotMarkers(new Map())
      return
    }

    // 기존 스팟 마커 제거
    mapProvider.clearMarkersByType?.('spot')

    // 스팟 마커 이미지 생성 (Sparkles 아이콘 형태)
    const spotMarkerImageSrc = createSpotMarkerImageUrl()
    const markerImageSize = getSpotMarkerImageSize()
    const markerImageOffset = getSpotMarkerImageOffset()

    // 각 스팟에 마커 추가 (북마크된 명소는 다른 색상)
    const newSpotMarkers = new Map<number, string>()
    spots.forEach((spot) => {
      // 북마크된 명소인지 확인
      const isBookmarkedSpot = isSpotBookmarked(spot.id)
      
      // 표시 조건:
      // - 일반 명소: isSpotVisible이 true일 때만 표시
      // - 북마크된 명소: isSpotVisible이 true이거나 isBookmarkVisible이 true일 때 표시
      const shouldShowSpot = isSpotVisible || (isBookmarkedSpot && isBookmarkVisible && isAuthenticated)
      
      if (!shouldShowSpot) {
        return // 이 명소는 표시하지 않음
      }
      
      // 북마크된 명소는 다른 색상의 마커 사용
      const markerImageSrc = isBookmarkedSpot
        ? createSpotMarkerImageUrl({ backgroundColor: '#3b82f6' }) // 파란색 (북마크된 명소)
        : spotMarkerImageSrc // 주황색 (일반 명소)
      
      const markerId = mapProvider.addMarker(
        { lat: spot.latitude, lng: spot.longitude },
        {
          type: 'spot',
          data: spot,
          image: {
            src: markerImageSrc,
            size: markerImageSize,
            options: { offset: markerImageOffset },
          },
          clickable: true,
          zIndex: isBookmarkedSpot ? 2 : 1, // 북마크된 명소는 더 높은 z-index
        }
      )
      newSpotMarkers.set(spot.id, markerId)
    })

    setSpotMarkers(newSpotMarkers)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitialized, mapProvider, spots, isSpotVisible, isBookmarkVisible, isAuthenticated, bookmarks]) // isBookmarkVisible과 isAuthenticated도 watch

  // 북마크 마커 표시
  useEffect(() => {
    if (!isInitialized || !mapProvider || !isAuthenticated) return

    // 나만의 장소 표시가 꺼져있으면 CUSTOM 타입 마커만 제거
    if (!isBookmarkVisible) {
      const customBookmarks = bookmarks.filter((b) => b.type === 'CUSTOM')
      customBookmarks.forEach((bookmark) => {
        if (bookmark.bookmarkId) {
          const markerId = bookmarkMarkers.get(bookmark.bookmarkId)
          if (markerId) {
            mapProvider.removeMarker(markerId)
          }
        }
      })
      // CUSTOM 타입만 제거하고 SPOT 타입은 유지
      setBookmarkMarkers((prev) => {
        const newMap = new Map(prev)
        customBookmarks.forEach((bookmark) => {
          if (bookmark.bookmarkId) {
            newMap.delete(bookmark.bookmarkId)
          }
        })
        return newMap
      })
      return
    }

    // 북마크 마커 이미지 생성
    const bookmarkMarkerImageSrc = createBookmarkMarkerImageUrl()
    const bookmarkMarkerImageSize = getBookmarkMarkerImageSize()
    const bookmarkMarkerImageOffset = getBookmarkMarkerImageOffset()

    // CUSTOM 타입 북마크만 마커로 표시 (SPOT 타입은 명소 마커와 중복되므로 제외)
    const customBookmarks = bookmarks.filter((b) => b.type === 'CUSTOM' && b.latitude && b.longitude)
    
    // 현재 마커에 없는 북마크만 찾기 (추가할 북마크)
    const bookmarksToAdd = customBookmarks.filter((bookmark) => {
      if (!bookmark.bookmarkId) return false
      return !bookmarkMarkers.has(bookmark.bookmarkId)
    })

    // 현재 북마크 리스트에 없는 마커 찾기 (제거할 마커)
    // CUSTOM 타입 북마크만 마커로 표시하므로, CUSTOM 타입이 아니거나 북마크 리스트에 없으면 제거
    const markersToRemove: number[] = []
    bookmarkMarkers.forEach((markerId, bookmarkId) => {
      const bookmark = bookmarks.find((b) => b.bookmarkId === bookmarkId)
      // 북마크가 없거나, CUSTOM 타입이 아니면 제거
      if (!bookmark || bookmark.type !== 'CUSTOM') {
        markersToRemove.push(bookmarkId)
      }
    })

    // 제거할 마커 삭제
    const newBookmarkMarkers = new Map(bookmarkMarkers)
    markersToRemove.forEach((bookmarkId) => {
      const markerId = newBookmarkMarkers.get(bookmarkId)
      if (markerId) {
        mapProvider.removeMarker(markerId)
        newBookmarkMarkers.delete(bookmarkId)
      }
    })

    // 추가할 북마크 마커 생성
    bookmarksToAdd.forEach((bookmark) => {
      if (!bookmark.bookmarkId || !bookmark.latitude || !bookmark.longitude) return

      const markerId = mapProvider.addMarker(
        { lat: bookmark.latitude, lng: bookmark.longitude },
        {
          type: 'bookmark',
          data: bookmark,
          image: {
            src: bookmarkMarkerImageSrc,
            size: bookmarkMarkerImageSize,
            options: { offset: bookmarkMarkerImageOffset },
          },
          clickable: true,
          zIndex: 1,
        }
      )
      newBookmarkMarkers.set(bookmark.bookmarkId, markerId)
    })

    setBookmarkMarkers(newBookmarkMarkers)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitialized, mapProvider, bookmarks, isBookmarkVisible, isAuthenticated])

  // 인증 상태 변경 시 북마크 로드
  useEffect(() => {
    if (isAuthenticated && isInitialized) {
      loadBookmarks()
    } else if (!isAuthenticated) {
      // 로그아웃 시 북마크 리스트 초기화
      setBookmarks([])
      // 북마크 마커 제거
      if (mapProvider) {
        bookmarkMarkers.forEach((markerId) => {
          mapProvider.removeMarker(markerId)
        })
        setBookmarkMarkers(new Map())
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isInitialized])

  // 선택된 북마크가 업데이트되면 selectedBookmark도 업데이트
  useEffect(() => {
    if (selectedBookmark && selectedBookmark.bookmarkId) {
      const updatedBookmark = bookmarks.find(
        (b) => b.bookmarkId === selectedBookmark.bookmarkId
      )
      if (updatedBookmark) {
        // 북마크가 업데이트되었으면 selectedBookmark도 업데이트
        setSelectedBookmark(updatedBookmark)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookmarks])

  // 마커 클릭 이벤트 핸들러 설정 (기존 핸들러 보존)
  useEffect(() => {
    if (!isInitialized || !mapProvider) return

    // 스팟이 변경될 때마다 마커 클릭 핸들러 업데이트
    mapProvider.setEventHandlers({
      onMarkerClick: async (markerId: string, data?: any, position?: MapPosition) => {
        // 사용자 지정 마커 클릭 시 북마크 추가 모달 표시
        if (markerId.startsWith('user_marker_') || (data && data.type === 'user')) {
          if (isAuthenticated) {
            // 마커의 실제 위치 사용 (드래그된 경우를 위해)
            const currentPosition = position || { lat, lng: lon }
            
            // 마커 위치를 state에도 업데이트 (동기화)
            if (position) {
              setLat(position.lat)
              setLon(position.lng)
            }
            
            setIsLoadingBookmarkAddress(true)
            try {
              const address = await mapProvider.getAddressFromPosition(currentPosition)
              setBookmarkModalPosition(currentPosition)
              setBookmarkModalAddress(address)
              setIsBookmarkModalOpen(true)
            } catch (error) {
              console.error('주소 변환 오류:', error)
              toast({
                title: '오류',
                description: '주소를 가져오는 중 오류가 발생했습니다.',
                variant: 'destructive',
              })
            } finally {
              setIsLoadingBookmarkAddress(false)
            }
          }
          return
        }
        
        if (data && typeof data.id === 'number') {
          const spot = spots.find((s) => s.id === data.id)
          if (spot) {
            // 지도 중심 이동
            mapProvider.setCenter({ lat: spot.latitude, lng: spot.longitude }, true)
            // 스팟 정보 표시
            setSelectedSpot(spot)
            setOpenSpotId(spot.id)
            // 북마크 모달 닫기
            setSelectedBookmark(null)
            setOpenBookmarkId(null)
          }
        } else if (data && data.bookmarkId) {
          // 북마크 마커 클릭 시 통합 모달 표시
          const bookmark = bookmarks.find((b) => b.bookmarkId === data.bookmarkId)
          if (bookmark) {
            // 북마크 위치로 이동
            if (bookmark.latitude && bookmark.longitude) {
              mapProvider.setCenter({ lat: bookmark.latitude, lng: bookmark.longitude }, true)
            }
            // 북마크 정보 표시
            setSelectedBookmark(bookmark)
            setOpenBookmarkId(bookmark.bookmarkId || null)
            // 명소 모달 닫기
            setSelectedSpot(null)
            setOpenSpotId(null)
          }
        }
      },
    })
  }, [isInitialized, mapProvider, spots, bookmarks, isAuthenticated, toast])

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
        {/* 필터링 토글 버튼 */}
        {isInitialized && (
          <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
            <div className="bg-card/95 backdrop-blur-sm rounded-lg p-2 shadow-lg border border-border/50">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="spot-filter"
                    checked={isSpotVisible}
                    onCheckedChange={setIsSpotVisible}
                  />
                  <Label htmlFor="spot-filter" className="text-sm font-medium cursor-pointer">
                    명소 보기
                  </Label>
                </div>
                {isAuthenticated && (
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="bookmark-filter"
                      checked={isBookmarkVisible}
                      onCheckedChange={setIsBookmarkVisible}
                    />
                    <Label htmlFor="bookmark-filter" className="text-sm font-medium cursor-pointer">
                      나만의 장소 보기
                    </Label>
                  </div>
                )}
              </div>
            </div>
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
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-medium">{searchRadius}</span>
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
        {/* 명소/북마크 통합 상세 모달 */}
        {selectedSpot && openSpotId === selectedSpot.id && (
          <SpotDetailModal
            spot={selectedSpot}
            onClose={() => {
              setSelectedSpot(null)
              setOpenSpotId(null)
            }}
            onLocationSelect={async (lat, lng, address) => {
              setLat(lat)
              setLon(lng)
              
              // 사용자 지정 마커 위치 변경
              if (markerIdRef.current) {
                mapProvider.removeMarker(markerIdRef.current)
                markerIdRef.current = null
              }
              markerIdRef.current = mapProvider.setMarker({ lat, lng })
              
              setLocationName?.(address)
            }}
            mapProvider={mapProvider}
          />
        )}
        
        {selectedBookmark && openBookmarkId === selectedBookmark.bookmarkId && (
          <SpotDetailModal
            bookmark={selectedBookmark}
            onClose={() => {
              setSelectedBookmark(null)
              setOpenBookmarkId(null)
            }}
            onLocationSelect={async (lat, lng, address) => {
              setLat(lat)
              setLon(lng)
              
              // 사용자 지정 마커 위치 변경
              if (markerIdRef.current) {
                mapProvider.removeMarker(markerIdRef.current)
                markerIdRef.current = null
              }
              markerIdRef.current = mapProvider.setMarker({ lat, lng })
              
              setLocationName?.(address)
            }}
            mapProvider={mapProvider}
          />
        )}
        {/* 북마크 추가 모달 */}
        <BookmarkModal
          open={isBookmarkModalOpen}
          onOpenChange={setIsBookmarkModalOpen}
          position={bookmarkModalPosition}
          address={bookmarkModalAddress}
          onSave={(newBookmark) => {
            // 북마크가 추가되면 store에 이미 추가되어 있으므로
            // 북마크 마커 표시 useEffect가 자동으로 트리거되어 마커가 표시됨
            // 응답 데이터를 바로 사용하여 지도에 반영 (loadBookmarks() 호출 불필요)
            console.log('[MapSelector] 북마크 추가 완료, 지도에 바로 반영:', newBookmark)
          }}
        />
      </div>
    </div>
  )
}

