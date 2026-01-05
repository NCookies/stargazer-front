# Map Provider Architecture

이 디렉토리는 지도 API를 추상화한 Provider 패턴을 구현합니다.

## 주요 기능

- **인터페이스 기반 설계**: Provider 간 쉽게 전환 가능
- **지역 자동 감지**: 한국은 카카오맵, 해외는 구글맵 자동 선택
- **유연한 설정**: 환경 변수 또는 props로 강제 설정 가능

## 구조

```
lib/map/
├── types.ts                    # IMapProvider 인터페이스 및 타입 정의
├── utils.ts                    # 지역 감지 유틸리티
├── README.md                   # 이 파일
└── providers/
    ├── index.ts               # Provider export
    └── kakao-map-provider.tsx # 카카오 지도 구현체
    └── google-map-provider.tsx # 구글 지도 구현체 (추후 추가)
```

## 사용 방법

### 1. 환경 변수 설정

`.env.local` 파일에 다음 변수를 설정하세요:

```env
# 카카오 지도 API 키 (한국용)
NEXT_PUBLIC_KAKAO_APP_KEY=your_kakao_javascript_key
NEXT_PUBLIC_KAKAO_REST_API_KEY=your_kakao_rest_api_key

# 구글 지도 API 키 (해외용, 추후 추가 시)
# NEXT_PUBLIC_GOOGLE_MAP_API_KEY=your_google_map_api_key

# Provider 강제 설정 (선택사항)
# 설정하지 않으면 지역 자동 감지 사용
# NEXT_PUBLIC_MAP_PROVIDER=kakao  # 또는 google
```

### 2. MapProvider 설정

`app/layout.tsx`에서 `MapProvider`로 앱을 감싸세요:

```tsx
import { MapProvider } from "@/components/map/map-provider"

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {/* 지역 자동 감지 사용 (기본값) */}
        <MapProvider>
          {children}
        </MapProvider>

        {/* 또는 특정 Provider 강제 사용 */}
        {/* <MapProvider providerType="kakao"> */}
        {/*   {children} */}
        {/* </MapProvider> */}

        {/* 지역 자동 감지 비활성화 */}
        {/* <MapProvider enableAutoDetection={false}> */}
        {/*   {children} */}
        {/* </MapProvider> */}
      </body>
    </html>
  )
}
```

### 3. MapSelector 사용

```tsx
import MapSelector from "@/components/map/map-selector"

<MapSelector
  lat={lat}
  lon={lon}
  setLat={setLat}
  setLon={setLon}
  setLocationName={setLocationName}
/>
```

## 지역 자동 감지

MapProvider는 사용자의 지역을 자동으로 감지하여 적절한 Provider를 선택합니다:

- **한국**: 카카오맵 사용 (타임존: Asia/Seoul 또는 locale: ko)
- **해외**: 구글맵 사용 (그 외 모든 지역)

### 감지 우선순위

1. **Props의 `providerType`** (최우선)
2. **환경 변수 `NEXT_PUBLIC_MAP_PROVIDER`**
3. **지역 자동 감지** (`enableAutoDetection=true`일 때)
   - 타임존 기반 감지 (기본)
   - 브라우저 locale 기반 감지

### 지역 감지 방식

`lib/map/utils.ts`에서 다음 방식으로 지역을 감지합니다:

- **타임존**: `Intl.DateTimeFormat().resolvedOptions().timeZone` (기본)
- **브라우저 locale**: `navigator.language`
- **GeoIP API**: 선택적 (현재 비활성화, 필요 시 구현)

## 새로운 Provider 추가하기

구글맵을 추가하려면:

1. `lib/map/providers/google-map-provider.tsx` 생성
2. `IMapProvider` 인터페이스 구현
3. `lib/map/providers/index.ts`에 export 추가
4. `components/map/map-provider.tsx`에서 case 추가
5. 환경 변수 설정 (선택사항)

예시:

```tsx
// lib/map/providers/google-map-provider.tsx
export class GoogleMapProvider implements IMapProvider {
  // IMapProvider 인터페이스 구현
  async initialize(...) { /* 구현 */ }
  setCenter(...) { /* 구현 */ }
  // ... 나머지 메서드들
}
```

## 인터페이스

모든 Provider는 `IMapProvider` 인터페이스를 구현해야 합니다:

- `initialize()` - 지도 초기화
- `setCenter()` - 중심 위치 설정
- `setZoom()` - 확대/축소 레벨 설정
- `setMarker()` - 마커 추가/업데이트
- `removeMarker()` - 마커 제거
- `clearMarkers()` - 모든 마커 제거
- `setEventHandlers()` - 이벤트 핸들러 등록
- `searchPlaces()` - 장소 검색
- `getAddressFromPosition()` - 좌표→주소 변환
- `destroy()` - 리소스 정리
- `isInitialized()` - 초기화 여부 확인

자세한 내용은 `lib/map/types.ts`를 참조하세요.

## 국내/해외 서비스 확장

이 아키텍처는 국내와 해외 서비스를 쉽게 확장할 수 있도록 설계되었습니다:

- **국내 서비스**: 카카오맵 자동 선택
- **해외 서비스**: 구글맵 자동 선택
- **코드 변경 불필요**: Provider 구현만 추가하면 됨

