# 별볼일 🌟

> 오늘 밤 별볼일 있나요?

별볼일은 날씨, 천문, 광해 데이터를 종합 분석하여 최적의 별 관측 시간을 찾아드리는 서비스입니다.

## 📋 서비스 소개

별볼일은 천체 관측을 계획하는 분들을 위해 다음과 같은 정보를 제공합니다:

- **주간 예보**: 향후 일주일간의 관측 적합도 예보
- **실시간 분석**: 특정 날짜와 시간대의 관측 적합도 상세 분석
- **위치 기반 분석**: 지도에서 위치를 선택하여 해당 지역의 관측 조건 확인
- **종합 점수**: 날씨, 구름량, 달의 위상, 광해 등 다양한 요소를 종합한 관측 적합도 점수

## 🛠️ 기술 스택

- **프레임워크**: Next.js 16
- **언어**: TypeScript
- **UI 라이브러리**: 
  - React 19
  - Radix UI
  - Tailwind CSS
- **지도**: Leaflet (OpenStreetMap)
- **차트**: Recharts
- **패키지 관리자**: pnpm

## 📦 설치 방법

### 필수 요구사항

- Node.js 18 이상
- pnpm (권장) 또는 npm, yarn

### 설치 단계

1. 저장소 클론
```bash
git clone <repository-url>
cd stargazer-front
```

2. 의존성 설치
```bash
pnpm install
```

3. 환경 변수 설정 (필요한 경우)
```bash
# .env.local 파일 생성 및 필요한 환경 변수 설정
```

4. 개발 서버 실행
```bash
pnpm dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 🚀 실행 방법

### 개발 모드
```bash
pnpm dev
```

### 프로덕션 빌드
```bash
pnpm build
pnpm start
```

### 린트 실행
```bash
pnpm lint
```

## 🔧 프로젝트 구조

```
stargazer-front/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # 루트 레이아웃
│   ├── page.tsx           # 메인 페이지
│   └── globals.css        # 전역 스타일
├── components/            # React 컴포넌트
│   ├── header.tsx        # 헤더 컴포넌트
│   ├── input-section.tsx # 입력 섹션
│   ├── result-section.tsx # 결과 섹션
│   ├── forecast-view.tsx # 예보 뷰
│   ├── MapSelector.tsx   # 지도 선택기
│   └── ui/               # UI 컴포넌트 (shadcn/ui)
├── hooks/                # 커스텀 훅
├── lib/                  # 유틸리티 함수
├── types/                # TypeScript 타입 정의
└── public/               # 정적 파일
```

## 🌐 API 연동

백엔드 API는 `next.config.mjs`에서 프록시 설정되어 있습니다:

- 개발 환경: `http://localhost:8080/api`
- 프로덕션 환경: 백엔드 서버 URL로 변경 필요

### 주요 API 엔드포인트

- `POST /api/v1/analyze`: 특정 시간대의 관측 적합도 분석
- `POST /api/v1/forecast`: 주간 관측 적합도 예보

## 🎨 주요 기능

### 1. 위치 선택
- 지도에서 클릭하여 위치 선택
- 장소 검색 기능 (OpenStreetMap Nominatim API 사용)

### 2. 주간 예보
- 향후 일주일간의 관측 적합도 예보
- 날짜별 상세 정보 확인

### 3. 실시간 분석
- 특정 날짜와 시간 선택
- 종합 점수 및 상세 분석 결과 확인
- 날씨, 구름량, 달의 위상, 광해 등 세부 정보 제공

## 📝 향후 계획

### 단기 계획
- [ ] 로고 이미지 추가
- [ ] 사용법 가이드 페이지 추가
- [ ] 피드백 기능 구현
- [ ] 모바일 반응형 UI 개선

### 중기 계획
- [ ] 사용자 인증 및 관심 위치 저장 기능
- [ ] 관측 기록 및 일기 기능
- [ ] 알림 기능 (관측 적합도가 좋은 날 알림)
- [ ] 커뮤니티 기능 (관측 후기 공유)

### 장기 계획
- [ ] AI 기반 관측 추천 시스템
- [ ] 실시간 관측 조건 모니터링
- [ ] 관측 포인트 지도 (다른 사용자들이 추천한 관측 장소)

---

**별볼일**과 함께 가장 아름다운 별을 만나보세요! ✨


