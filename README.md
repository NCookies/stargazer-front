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

3. 환경 변수 설정

`.env.local` 파일에 다음 환경 변수를 설정하세요:

```bash
# 백엔드 API 주소
NEXT_PUBLIC_API_URL=http://localhost:8080
# 배포 서버 테스트 시: NEXT_PUBLIC_API_URL=https://api.byeolbolil.xyz

# 카카오 지도 API 키 (필수)
# 카카오 개발자 콘솔(https://developers.kakao.com/)에서 발급받은 키를 입력하세요
NEXT_PUBLIC_KAKAO_APP_KEY=your_javascript_key_here
NEXT_PUBLIC_KAKAO_REST_API_KEY=your_rest_api_key_here
```

**카카오 지도 API 키 발급 방법:**
1. [카카오 개발자 콘솔](https://developers.kakao.com/) 접속
2. 내 애플리케이션 > 애플리케이션 추가하기
3. 플랫폼 > Web 플랫폼 등록
   - 로컬 개발: `http://localhost:3000`
   - 프로덕션: 실제 도메인 (예: `https://yourdomain.vercel.app`)
4. 앱 키 > JavaScript 키 및 REST API 키 복사
5. `.env.local` 파일에 입력

자세한 설정 방법은 [`lib/map/KAKAO_SETUP.md`](lib/map/KAKAO_SETUP.md)를 참고하세요.

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

백엔드 API는 환경 변수를 통해 설정됩니다:

- **로컬 개발 환경**: `NEXT_PUBLIC_API_URL=http://localhost:8080` (기본값)
- **Vercel 배포 환경**: `NEXT_PUBLIC_API_URL=https://api.byeolbolil.xyz`

### 환경 변수 설정

#### 로컬 개발
`.env.local` 파일에서 백엔드 주소를 설정할 수 있습니다:
```bash
# 로컬 백엔드 서버 사용 (기본값)
NEXT_PUBLIC_API_URL=http://localhost:8080

# 또는 배포 서버로 테스트
NEXT_PUBLIC_API_URL=https://api.byeolbolil.xyz
```

환경 변수를 변경한 후에는 개발 서버를 재시작해야 합니다.

#### Vercel 배포
Vercel 프로젝트 설정에서 환경 변수를 추가하세요:
1. Vercel 대시보드 → 프로젝트 선택 → Settings → Environment Variables
2. `NEXT_PUBLIC_API_URL` 변수 추가
3. Value: `https://api.byeolbolil.xyz`
4. Environment: Production, Preview, Development 모두 선택

또는 `vercel.json` 파일에 이미 설정되어 있습니다.

### 주요 API 엔드포인트

- `GET /api/v1/analyze`: 특정 시간대의 관측 적합도 분석
- `GET /api/v1/forecast`: 주간 관측 적합도 예보

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


