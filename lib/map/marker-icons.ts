/**
 * 지도 마커 아이콘 설정
 * 명소 마커 아이콘을 일괄적으로 관리합니다.
 */

export interface SpotMarkerIconConfig {
  /** 마커 배경색 */
  backgroundColor: string
  /** 마커 테두리색 */
  borderColor: string
  /** 마커 테두리 두께 */
  borderWidth: number
  /** 아이콘 색상 */
  iconColor: string
  /** 마커 크기 (width, height) */
  size: number
  /** 마커 중앙 오프셋 (x, y) */
  offset: { x: number; y: number }
}

/**
 * 명소 마커 아이콘 설정 (Sparkles 아이콘 스타일)
 */
export const SPOT_MARKER_CONFIG: SpotMarkerIconConfig = {
  backgroundColor: '#f97316', // 주황색 배경
  borderColor: '#fff', // 흰색 테두리
  borderWidth: 1.5,
  iconColor: '#fff', // 흰색 아이콘
  size: 30,
  offset: { x: 15, y: 15 },
}

/**
 * Sparkles 아이콘 형태의 SVG 생성
 * 명소 마커에 사용되는 아이콘 (lucide-react Sparkles 아이콘과 유사한 형태)
 */
function createSparklesIconSVG(config: SpotMarkerIconConfig): string {
  const { backgroundColor, borderColor, borderWidth, iconColor, size } = config
  const center = size / 2
  const radius = center - borderWidth

  // Sparkles 아이콘: 중앙 큰 별과 주변 작은 별들 (4방향)
  // lucide-react의 Sparkles 아이콘과 유사한 형태로 구성
  const svg = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
    <circle cx="${center}" cy="${center}" r="${radius}" fill="${backgroundColor}" stroke="${borderColor}" stroke-width="${borderWidth}"/>
    <!-- 중앙 큰 별 -->
    <path d="M${center} ${center - 5.5} L${center + 2.2} ${center - 1.2} L${center + 5.5} ${center - 0.8} L${center + 3.2} ${center + 1.8} L${center + 3.6} ${center + 5} L${center} ${center + 2.8} L${center - 3.6} ${center + 5} L${center - 3.2} ${center + 1.8} L${center - 5.5} ${center - 0.8} L${center - 2.2} ${center - 1.2} Z" fill="${iconColor}"/>
    <!-- 좌측 위 작은 별 -->
    <path d="M${center - 5} ${center - 4.5} L${center - 4.2} ${center - 4} L${center - 3.2} ${center - 4} L${center - 4.2} ${center - 3.2} L${center - 4.5} ${center - 1.8} L${center - 5} ${center - 3.2} L${center - 5.8} ${center - 1.8} Z" fill="${iconColor}"/>
    <!-- 우측 아래 작은 별 -->
    <path d="M${center + 5} ${center + 4.5} L${center + 4.2} ${center + 4} L${center + 3.2} ${center + 4} L${center + 4.2} ${center + 3.2} L${center + 4.5} ${center + 1.8} L${center + 5} ${center + 3.2} L${center + 5.8} ${center + 1.8} Z" fill="${iconColor}"/>
    <!-- 좌측 아래 작은 별 -->
    <path d="M${center - 4.2} ${center + 3.8} L${center - 3.6} ${center + 3.6} L${center - 2.5} ${center + 3.8} L${center - 3.2} ${center + 4.2} L${center - 3.4} ${center + 5.5} L${center - 4.2} ${center + 4.8} L${center - 5} ${center + 5.5} Z" fill="${iconColor}"/>
    <!-- 우측 위 작은 별 -->
    <path d="M${center + 4.2} ${center - 3.8} L${center + 3.6} ${center - 3.6} L${center + 2.5} ${center - 3.8} L${center + 3.2} ${center - 4.2} L${center + 3.4} ${center - 5.5} L${center + 4.2} ${center - 4.8} L${center + 5} ${center - 5.5} Z" fill="${iconColor}"/>
  </svg>`.trim()

  return svg
}

/**
 * 명소 마커 이미지 URL 생성
 * SVG를 data URL로 변환하여 반환합니다.
 */
export function createSpotMarkerImageUrl(config?: Partial<SpotMarkerIconConfig>): string {
  const mergedConfig: SpotMarkerIconConfig = {
    ...SPOT_MARKER_CONFIG,
    ...config,
  }

  const svg = createSparklesIconSVG(mergedConfig)
  // SVG를 URL 인코딩하여 사용
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg)
}

/**
 * 명소 마커 이미지 크기 반환
 */
export function getSpotMarkerImageSize(config?: Partial<SpotMarkerIconConfig>): { width: number; height: number } {
  const size = config?.size ?? SPOT_MARKER_CONFIG.size
  return { width: size, height: size }
}

/**
 * 명소 마커 이미지 오프셋 반환
 */
export function getSpotMarkerImageOffset(config?: Partial<SpotMarkerIconConfig>): { x: number; y: number } {
  return config?.offset ?? SPOT_MARKER_CONFIG.offset
}

/**
 * 북마크 마커 아이콘 설정 (별 모양)
 */
export const BOOKMARK_MARKER_CONFIG: SpotMarkerIconConfig = {
  backgroundColor: '#3b82f6', // 파란색 배경
  borderColor: '#fff', // 흰색 테두리
  borderWidth: 1.5,
  iconColor: '#fff', // 흰색 아이콘
  size: 30,
  offset: { x: 15, y: 15 },
}

/**
 * 북마크 마커 아이콘 SVG 생성 (별 모양)
 */
function createBookmarkIconSVG(config: SpotMarkerIconConfig): string {
  const { backgroundColor, borderColor, borderWidth, iconColor, size } = config
  const center = size / 2
  const radius = center - borderWidth

  // 별 모양 아이콘
  const svg = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
    <circle cx="${center}" cy="${center}" r="${radius}" fill="${backgroundColor}" stroke="${borderColor}" stroke-width="${borderWidth}"/>
    <!-- 별 모양 -->
    <path d="M${center} ${center - 6} L${center + 2.5} ${center - 1.5} L${center + 6.5} ${center - 1} L${center + 3.5} ${center + 2} L${center + 4} ${center + 6} L${center} ${center + 3.5} L${center - 4} ${center + 6} L${center - 3.5} ${center + 2} L${center - 6.5} ${center - 1} L${center - 2.5} ${center - 1.5} Z" fill="${iconColor}"/>
  </svg>`.trim()

  return svg
}

/**
 * 북마크 마커 이미지 URL 생성
 */
export function createBookmarkMarkerImageUrl(config?: Partial<SpotMarkerIconConfig>): string {
  const mergedConfig: SpotMarkerIconConfig = {
    ...BOOKMARK_MARKER_CONFIG,
    ...config,
  }

  const svg = createBookmarkIconSVG(mergedConfig)
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg)
}

/**
 * 북마크 마커 이미지 크기 반환
 */
export function getBookmarkMarkerImageSize(config?: Partial<SpotMarkerIconConfig>): { width: number; height: number } {
  const size = config?.size ?? BOOKMARK_MARKER_CONFIG.size
  return { width: size, height: size }
}

/**
 * 북마크 마커 이미지 오프셋 반환
 */
export function getBookmarkMarkerImageOffset(config?: Partial<SpotMarkerIconConfig>): { x: number; y: number } {
  return config?.offset ?? BOOKMARK_MARKER_CONFIG.offset
}
