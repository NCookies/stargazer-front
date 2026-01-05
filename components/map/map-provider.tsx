"use client"

import React, { createContext, useContext, useEffect, useRef, useState } from 'react'
import type { IMapProvider, MapPosition } from '@/lib/map/types'
import { KakaoMapProvider } from '@/lib/map/providers/kakao-map-provider'
import { detectIsKorea, getForcedProviderType } from '@/lib/map/utils'

/**
 * MapProvider 타입 (환경 변수로 변경 가능)
 */
type MapProviderType = 'kakao' | 'google'

/**
 * MapProvider Context
 */
interface MapContextValue {
  mapProvider: IMapProvider | null
  isReady: boolean
  providerType: MapProviderType | null
}

const MapContext = createContext<MapContextValue | null>(null)

/**
 * MapProvider Hook
 */
export function useMapProvider() {
  const context = useContext(MapContext)
  if (!context) {
    throw new Error('useMapProvider must be used within MapProvider')
  }
  return context
}

/**
 * MapProvider Props
 */
interface MapProviderProps {
  children: React.ReactNode
  /**
   * 강제로 사용할 Provider 타입 (지역 자동 감지 무시)
   */
  providerType?: MapProviderType
  /**
   * 지역 자동 감지 활성화 여부 (기본값: true)
   * false로 설정하면 환경 변수 또는 providerType만 사용
   */
  enableAutoDetection?: boolean
}

/**
 * 지역에 따라 적절한 Provider 타입 결정
 * 
 * - 한국: 카카오맵
 * - 해외: 구글맵
 */
function determineProviderType(
  forcedType?: MapProviderType,
  enableAutoDetection: boolean = true
): MapProviderType {
  // 1. props로 강제 지정된 경우
  if (forcedType) {
    return forcedType
  }

  // 2. 환경 변수로 강제 지정된 경우
  const envForcedType = getForcedProviderType()
  if (envForcedType) {
    return envForcedType
  }

  // 3. 지역 자동 감지
  if (enableAutoDetection) {
    const isKorea = detectIsKorea('timezone') // 타임존 기반 감지
    return isKorea ? 'kakao' : 'google'
  }

  // 4. 기본값 (지역 감지 비활성화 시)
  return 'kakao'
}

/**
 * MapProvider 컴포넌트
 * 
 * 지역 자동 감지 기능:
 * - 한국: 카카오맵 사용
 * - 해외: 구글맵 사용 (구현 시)
 * 
 * 우선순위:
 * 1. props의 providerType
 * 2. 환경 변수 NEXT_PUBLIC_MAP_PROVIDER
 * 3. 지역 자동 감지 (enableAutoDetection=true일 때)
 */
export function MapProvider({
  children,
  providerType,
  enableAutoDetection = true,
}: MapProviderProps) {
  console.log('[MapProvider] 컴포넌트 렌더링')
  const [mapProvider, setMapProvider] = useState<IMapProvider | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [currentProviderType, setCurrentProviderType] = useState<MapProviderType | null>(null)
  const providerRef = useRef<IMapProvider | null>(null)

  useEffect(() => {
    console.log('[MapProvider] 초기화 시작', {
      providerType,
      enableAutoDetection,
      envProvider: process.env.NEXT_PUBLIC_MAP_PROVIDER,
    })

    // Provider 타입 결정
    const type = determineProviderType(providerType, enableAutoDetection)
    console.log('[MapProvider] 결정된 Provider 타입:', type)
    setCurrentProviderType(type)

    let provider: IMapProvider

    try {
      switch (type) {
        case 'kakao':
          console.log('[MapProvider] KakaoMapProvider 생성 중...')
          provider = new KakaoMapProvider()
          console.log('[MapProvider] KakaoMapProvider 생성 완료')
          break
        case 'google':
          // TODO: GoogleMapProvider 구현 시 활성화
          // provider = new GoogleMapProvider()
          // break
          // 현재는 구글맵이 없으므로 fallback으로 카카오맵 사용
          console.warn('[MapProvider] GoogleMapProvider가 아직 구현되지 않았습니다. 카카오맵을 사용합니다.')
          provider = new KakaoMapProvider()
          break
        default:
          console.log('[MapProvider] 기본값으로 KakaoMapProvider 사용')
          provider = new KakaoMapProvider()
      }

      providerRef.current = provider
      setMapProvider(provider)
      setIsReady(true)
      console.log('[MapProvider] 초기화 완료, isReady: true')
    } catch (error) {
      console.error('[MapProvider] 초기화 오류:', error)
      setIsReady(false)
    }

    // cleanup
    return () => {
      console.log('[MapProvider] cleanup 실행')
      if (providerRef.current) {
        providerRef.current.destroy()
        providerRef.current = null
      }
    }
  }, [providerType, enableAutoDetection])

  return (
    <MapContext.Provider value={{ mapProvider, isReady, providerType: currentProviderType }}>
      {children}
    </MapContext.Provider>
  )
}

