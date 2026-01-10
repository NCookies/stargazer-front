"use client"

import type {
  IMapProvider,
  MapPosition,
  PlaceSearchResult,
  MapEventHandlers,
} from '../types'

/**
 * 카카오 지도 타입 선언
 */
declare global {
  interface Window {
    kakao: any
  }
}

/**
 * 카카오 지도 Provider 구현체
 */
interface MarkerInfo {
  marker: any
  type: string // 'user' | 'spot'
  data?: any
}

export class KakaoMapProvider implements IMapProvider {
  private map: any = null
  private markers: Map<string, MarkerInfo> = new Map()
  private nextMarkerId = 0
  private eventHandlers: MapEventHandlers = {}
  private isLoaded = false
  private containerId: string = ''
  private scriptLoaded = false
  private userMarkerId: string | null = null // 사용자 지정 마커 ID

  /**
   * 카카오 지도 스크립트 로드
   */
  private async loadScript(): Promise<void> {
    if (this.scriptLoaded || (typeof window !== 'undefined' && window.kakao)) {
      this.scriptLoaded = true
      return Promise.resolve()
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.async = true
      const appKey = process.env.NEXT_PUBLIC_KAKAO_APP_KEY
      
      // 환경 변수 디버깅
      console.log('[KakaoMapProvider] 환경 변수 확인:', {
        hasAppKey: !!appKey,
        appKeyLength: appKey?.length || 0,
        appKeyPrefix: appKey?.substring(0, 10) || 'N/A',
      })
      
      if (!appKey) {
        const errorMsg = 'NEXT_PUBLIC_KAKAO_APP_KEY 환경 변수가 설정되지 않았습니다. .env.local 파일을 확인하고 개발 서버를 재시작하세요.'
        console.error('[KakaoMapProvider]', errorMsg)
        reject(new Error(errorMsg))
        return
      }

      script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&autoload=false`
      console.log('[KakaoMapProvider] 카카오 지도 스크립트 로드 시작:', script.src.substring(0, 50) + '...')
      
      script.onload = () => {
        console.log('[KakaoMapProvider] 스크립트 로드 완료, 지도 API 초기화 중...')
        if (!window.kakao || !window.kakao.maps) {
          reject(new Error('카카오 지도 API가 로드되지 않았습니다.'))
          return
        }
        
        window.kakao.maps.load(() => {
          console.log('[KakaoMapProvider] 지도 API 초기화 완료')
          this.scriptLoaded = true
          resolve()
        })
      }
      script.onerror = (error) => {
        const errorMsg = '카카오 지도 스크립트를 로드할 수 없습니다. API 키와 네트워크 연결을 확인하세요.'
        console.error('[KakaoMapProvider]', errorMsg, error)
        reject(new Error(errorMsg))
      }
      document.head.appendChild(script)
    })
  }

  async initialize(
    containerId: string,
    initialPosition: MapPosition,
    options?: Record<string, any>
  ): Promise<void> {
    if (typeof window === 'undefined') {
      throw new Error('지도는 클라이언트 사이드에서만 초기화할 수 있습니다.')
    }

    // 스크립트 로드
    await this.loadScript()

    this.containerId = containerId
    const container = document.getElementById(containerId)
    
    if (!container) {
      throw new Error(`컨테이너를 찾을 수 없습니다: ${containerId}`)
    }

    const mapOptions = {
      center: new window.kakao.maps.LatLng(initialPosition.lat, initialPosition.lng),
      level: options?.zoom || 3,
      ...options,
    }

    console.log('[KakaoMapProvider] 지도 옵션:', {
      center: { lat: initialPosition.lat, lng: initialPosition.lng },
      level: mapOptions.level,
      containerSize: {
        width: container.offsetWidth,
        height: container.offsetHeight,
      },
    })

    try {
      this.map = new window.kakao.maps.Map(container, mapOptions)
      this.isLoaded = true
      console.log('[KakaoMapProvider] 지도 객체 생성 완료:', {
        mapExists: !!this.map,
        center: this.map.getCenter(),
        level: this.map.getLevel(),
      })

      // 클릭 이벤트 등록
      window.kakao.maps.event.addListener(this.map, 'click', (mouseEvent: any) => {
        const latlng = mouseEvent.latLng
        const position = {
          lat: latlng.getLat(),
          lng: latlng.getLng(),
        }
        console.log('[KakaoMapProvider] 지도 클릭:', position)
        this.eventHandlers.onMapClick?.(position)
      })

      // 우클릭 이벤트 등록
      window.kakao.maps.event.addListener(this.map, 'rightclick', (mouseEvent: any) => {
        // 기본 우클릭 메뉴 방지
        mouseEvent.preventDefault?.()
        
        const latlng = mouseEvent.latLng
        const position = {
          lat: latlng.getLat(),
          lng: latlng.getLng(),
        }
        console.log('[KakaoMapProvider] 지도 우클릭:', position)
        this.eventHandlers.onMapRightClick?.(position)
      })
    } catch (error) {
      console.error('[KakaoMapProvider] 지도 생성 오류:', error)
      throw new Error(`지도를 생성할 수 없습니다: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  setCenter(position: MapPosition, animate = true): void {
    if (!this.map) return

    const moveLatLon = new window.kakao.maps.LatLng(position.lat, position.lng)
    
    if (animate) {
      this.map.panTo(moveLatLon)
    } else {
      this.map.setCenter(moveLatLon)
    }
  }

  setZoom(level: number): void {
    if (!this.map) return
    this.map.setLevel(level)
  }

  setMarker(position: MapPosition, options?: Record<string, any>): string {
    if (!this.map) {
      throw new Error('지도가 초기화되지 않았습니다.')
    }

    const markerPosition = new window.kakao.maps.LatLng(position.lat, position.lng)

    // 기존 사용자 지정 마커만 제거
    if (this.userMarkerId) {
      this.removeMarker(this.userMarkerId)
    }

    const markerId = `user_marker_${this.nextMarkerId++}`
    const marker = new window.kakao.maps.Marker({
      position: markerPosition,
      ...options,
    })

    marker.setMap(this.map)
    this.markers.set(markerId, { marker, type: 'user' })
    this.userMarkerId = markerId

    // 드래그 이벤트 핸들러
    if (this.eventHandlers.onMarkerDrag) {
      window.kakao.maps.event.addListener(marker, 'dragend', () => {
        const pos = marker.getPosition()
        this.eventHandlers.onMarkerDrag?.({
          lat: pos.getLat(),
          lng: pos.getLng(),
        })
      })
    }

    return markerId
  }

  addMarker(position: MapPosition, options?: Record<string, any>): string {
    if (!this.map) {
      throw new Error('지도가 초기화되지 않았습니다.')
    }

    const markerPosition = new window.kakao.maps.LatLng(position.lat, position.lng)
    const markerType = (options?.type as string) || 'spot'
    const markerData = options?.data

    // 커스텀 이미지가 있는 경우
    let markerOptions: any = {
      position: markerPosition,
    }

    if (options?.image) {
      const imageSrc = options.image.src
      const imageSize = new window.kakao.maps.Size(
        options.image.size.width,
        options.image.size.height
      )
      const imageOption = options.image.options?.offset
        ? { offset: new window.kakao.maps.Point(options.image.options.offset.x, options.image.options.offset.y) }
        : {}

      const image = new window.kakao.maps.MarkerImage(imageSrc, imageSize, imageOption)
      markerOptions.image = image
    }

    if (options?.clickable !== undefined) {
      markerOptions.clickable = options.clickable
    }

    if (options?.zIndex !== undefined) {
      markerOptions.zIndex = options.zIndex
    }

    const markerId = `${markerType}_marker_${this.nextMarkerId++}`
    const marker = new window.kakao.maps.Marker(markerOptions)
    marker.setMap(this.map)
    this.markers.set(markerId, { marker, type: markerType, data: markerData })

    // 클릭 이벤트 핸들러
    if (options?.clickable !== false && this.eventHandlers.onMarkerClick) {
      window.kakao.maps.event.addListener(marker, 'click', () => {
        this.eventHandlers.onMarkerClick?.(markerId, markerData)
      })
    }

    // 드래그 이벤트 핸들러
    if (options?.draggable && this.eventHandlers.onMarkerDrag) {
      marker.setDraggable(true)
      window.kakao.maps.event.addListener(marker, 'dragend', () => {
        const pos = marker.getPosition()
        this.eventHandlers.onMarkerDrag?.({
          lat: pos.getLat(),
          lng: pos.getLng(),
        })
      })
    }

    return markerId
  }

  removeMarker(markerId: string): void {
    const markerInfo = this.markers.get(markerId)
    if (markerInfo) {
      markerInfo.marker.setMap(null)
      this.markers.delete(markerId)
      if (markerId === this.userMarkerId) {
        this.userMarkerId = null
      }
    }
  }

  clearMarkersByType(type: string): void {
    const toRemove: string[] = []
    this.markers.forEach((markerInfo, markerId) => {
      if (markerInfo.type === type) {
        markerInfo.marker.setMap(null)
        toRemove.push(markerId)
      }
    })
    toRemove.forEach((id) => {
      this.markers.delete(id)
      if (id === this.userMarkerId) {
        this.userMarkerId = null
      }
    })
  }

  clearMarkers(): void {
    this.markers.forEach((markerInfo) => {
      markerInfo.marker.setMap(null)
    })
    this.markers.clear()
    this.userMarkerId = null
    this.nextMarkerId = 0
  }

  setEventHandlers(handlers: MapEventHandlers): void {
    this.eventHandlers = { ...this.eventHandlers, ...handlers }
  }

  async searchPlaces(query: string): Promise<PlaceSearchResult[]> {
    if (!query.trim()) {
      return []
    }

    const restApiKey = process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY

    if (!restApiKey) {
      console.warn('카카오 REST API 키가 설정되지 않아 장소 검색을 사용할 수 없습니다.')
      return []
    }

    try {
      const response = await fetch(
        `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(query)}&size=5`,
        {
          headers: {
            Authorization: `KakaoAK ${restApiKey}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error('장소 검색에 실패했습니다.')
      }

      const data = await response.json()
      const documents = data.documents || []

      return documents.map((doc: any, index: number) => ({
        id: doc.id || `place_${index}`,
        name: doc.place_name || doc.address_name,
        address: doc.address_name,
        position: {
          lat: parseFloat(doc.y),
          lng: parseFloat(doc.x),
        },
      }))
    } catch (error) {
      console.error('장소 검색 오류:', error)
      return []
    }
  }

  async getAddressFromPosition(position: MapPosition): Promise<string> {
    const restApiKey = process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY

    if (!restApiKey) {
      return `위도: ${position.lat.toFixed(4)}, 경도: ${position.lng.toFixed(4)}`
    }

    try {
      const response = await fetch(
        `https://dapi.kakao.com/v2/local/geo/coord2address.json?x=${position.lng}&y=${position.lat}`,
        {
          headers: {
            Authorization: `KakaoAK ${restApiKey}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error('주소 변환에 실패했습니다.')
      }

      const data = await response.json()
      const documents = data.documents || []

      if (documents.length > 0) {
        const doc = documents[0]
        return doc.address?.address_name || doc.road_address?.address_name || `위도: ${position.lat.toFixed(4)}, 경도: ${position.lng.toFixed(4)}`
      }

      return `위도: ${position.lat.toFixed(4)}, 경도: ${position.lng.toFixed(4)}`
    } catch (error) {
      console.error('주소 변환 오류:', error)
      return `위도: ${position.lat.toFixed(4)}, 경도: ${position.lng.toFixed(4)}`
    }
  }

  destroy(): void {
    this.clearMarkers()
    this.eventHandlers = {}
    this.map = null
    this.isLoaded = false
    this.userMarkerId = null
  }

  isInitialized(): boolean {
    return this.isLoaded && this.map !== null
  }

  relayout(): void {
    if (!this.map || typeof window === 'undefined' || !window.kakao) return
    
    try {
      this.map.relayout()
    } catch (error) {
      console.error('[KakaoMapProvider] 리레이아웃 오류:', error)
    }
  }
}

