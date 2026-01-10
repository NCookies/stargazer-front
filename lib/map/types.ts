/**
 * 지도 좌표 타입
 */
export interface MapPosition {
  lat: number;
  lng: number;
}

/**
 * 장소 검색 결과 타입
 */
export interface PlaceSearchResult {
  id: string;
  name: string;
  address: string;
  position: MapPosition;
}

/**
 * 지도 이벤트 핸들러 타입
 */
export interface MapEventHandlers {
  onMapClick?: (position: MapPosition) => void;
  onMapRightClick?: (position: MapPosition) => void;
  onMarkerDrag?: (position: MapPosition) => void;
  onMarkerClick?: (markerId: string, data?: any) => void;
}

/**
 * 마커 옵션 타입
 */
export interface MarkerOptions {
  image?: {
    src: string;
    size: { width: number; height: number };
    options?: { offset?: { x: number; y: number } };
  };
  clickable?: boolean;
  draggable?: boolean;
  zIndex?: number;
  data?: any; // 마커에 연결할 추가 데이터
}

/**
 * 지도 Provider 인터페이스
 * 각 지도 라이브러리(Kakao, Google 등)가 구현해야 하는 공통 인터페이스
 */
export interface IMapProvider {
  /**
   * 지도 초기화
   * @param containerId 지도가 표시될 컨테이너 ID
   * @param initialPosition 초기 위치
   * @param options 추가 옵션
   */
  initialize(
    containerId: string,
    initialPosition: MapPosition,
    options?: Record<string, any>
  ): Promise<void>;

  /**
   * 지도 중심 위치 설정
   * @param position 새로운 중심 위치
   * @param animate 애니메이션 사용 여부
   */
  setCenter(position: MapPosition, animate?: boolean): void;

  /**
   * 지도 확대/축소 레벨 설정
   * @param level 확대/축소 레벨
   */
  setZoom(level: number): void;

  /**
   * 마커 추가 또는 업데이트
   * @param position 마커 위치
   * @param options 마커 옵션
   * @returns 마커 ID (업데이트 시 사용)
   */
  setMarker(position: MapPosition, options?: Record<string, any>): string;

  /**
   * 마커 추가 (여러 마커 관리용)
   * @param position 마커 위치
   * @param options 마커 옵션
   * @returns 마커 ID
   */
  addMarker(position: MapPosition, options?: Record<string, any>): string;

  /**
   * 마커 제거
   * @param markerId 마커 ID
   */
  removeMarker(markerId: string): void;

  /**
   * 특정 타입의 마커만 제거
   * @param type 마커 타입 (예: 'spot', 'user')
   */
  clearMarkersByType?(type: string): void;

  /**
   * 모든 마커 제거
   */
  clearMarkers(): void;

  /**
   * 지도 이벤트 핸들러 등록
   * @param handlers 이벤트 핸들러 객체
   */
  setEventHandlers(handlers: MapEventHandlers): void;

  /**
   * 장소 검색
   * @param query 검색어
   * @returns 검색 결과 배열
   */
  searchPlaces(query: string): Promise<PlaceSearchResult[]>;

  /**
   * 좌표를 주소로 변환
   * @param position 좌표
   * @returns 주소 문자열
   */
  getAddressFromPosition(position: MapPosition): Promise<string>;

  /**
   * 지도 정리 및 메모리 해제
   */
  destroy(): void;

  /**
   * 지도가 초기화되었는지 여부
   */
  isInitialized(): boolean;
}

