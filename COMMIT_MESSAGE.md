# 커밋 메시지

## 제목
feat: Leaflet 지도 API를 카카오 지도 API로 전환 및 MapProvider 인터페이스 패턴 도입

## 본문

### 주요 변경 사항

1. **지도 API 전환**
   - Leaflet(react-leaflet) → 카카오 지도 API로 전환
   - 카카오 지도 JavaScript SDK 통합
   - 장소 검색 및 좌표→주소 변환 기능 추가

2. **MapProvider 인터페이스 패턴 도입**
   - `IMapProvider` 인터페이스 정의로 지도 라이브러리 추상화
   - `KakaoMapProvider` 구현체 생성
   - 추후 구글맵 등 다른 Provider로 쉽게 전환 가능한 구조

3. **지역 자동 감지 기능**
   - 타임존 기반으로 한국/해외 자동 감지
   - 한국: 카카오맵, 해외: 구글맵 자동 선택 (구글맵 구현 시)
   - 환경 변수 또는 props로 강제 설정 가능

4. **지도 기능 구현**
   - 지도 초기화 및 표시
   - 마커 추가/제거/업데이트
   - 지도 클릭: 중심 이동
   - 지도 우클릭: 마커 위치 지정
   - 장소 검색 기능
   - 좌표→주소 변환 기능

5. **UI/UX 개선**
   - 로딩 상태 표시
   - 에러 메시지 표시
   - 검색 결과 드롭다운
   - 반응형 디자인 유지

### 파일 구조

```
lib/map/
├── types.ts                    # IMapProvider 인터페이스 및 타입 정의
├── utils.ts                    # 지역 감지 유틸리티
├── README.md                   # 사용 가이드
├── KAKAO_SETUP.md             # 카카오 지도 설정 가이드
└── providers/
    ├── index.ts
    └── kakao-map-provider.tsx  # 카카오 지도 구현체

components/map/
├── map-provider.tsx            # MapProvider Context 및 래퍼
└── map-selector.tsx            # MapSelector 컴포넌트
```

### 환경 변수

- `NEXT_PUBLIC_KAKAO_APP_KEY`: 카카오 JavaScript 키 (필수)
- `NEXT_PUBLIC_KAKAO_REST_API_KEY`: 카카오 REST API 키 (선택, 검색/주소 변환용)
- `NEXT_PUBLIC_MAP_PROVIDER`: Provider 강제 설정 (선택, 'kakao' | 'google')

### Breaking Changes

- 기존 `components/MapSelector.tsx` (Leaflet 기반) 삭제
- `components/map/map-selector.tsx`로 경로 변경
- `app/layout.tsx`에 `MapProvider` 추가 필요

### 향후 확장성

- 구글맵 Provider 추가 시 `GoogleMapProvider` 클래스만 구현하면 됨
- 지역 자동 감지로 국내/해외 서비스 확장 용이
- 인터페이스 기반 설계로 Provider 간 전환 간편

