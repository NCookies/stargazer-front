# 구현된 API 목록

이 문서는 현재 프론트엔드에 구현되어 있는 API 클라이언트 목록을 기록합니다.

**⚠️ 중요**: OpenAPI JSON이 업데이트될 때, 이 목록에 있는 API들은 이미 잘 동작하고 있으므로 수정하지 말고, 새로운 API만 추가하거나 변경된 부분만 업데이트해야 합니다.

## 업데이트 날짜
마지막 업데이트: 2025-01-XX

## 인증 API (`lib/api/auth.ts`)

### POST /api/v1/auth/login
- **함수명**: `authApi.login(credentials: LoginRequest): Promise<string>`
- **설명**: 이메일과 비밀번호로 로그인
- **파라미터**: `{ email: string, password: string }`
- **반환값**: Access Token (string)
- **특이사항**: 
  - Access Token을 authStore에 자동 저장
  - 에러 처리 포함

### POST /api/v1/auth/register
- **함수명**: `authApi.register(data: RegisterRequest): Promise<string>`
- **설명**: 새로운 회원 가입
- **파라미터**: `{ email: string, password: string, nickname: string }`
- **반환값**: Access Token (string)
- **특이사항**:
  - Access Token을 authStore에 자동 저장
  - 에러 처리 포함

### POST /api/v1/auth/reissue
- **함수명**: `authApi.reissue(): Promise<string>`
- **설명**: Refresh Token을 사용하여 Access Token 재발급
- **파라미터**: 없음 (Refresh Token은 HttpOnly Cookie에 있음)
- **반환값**: 새로운 Access Token (string)
- **특이사항**:
  - 순환 참조 방지를 위해 직접 axios 호출
  - CommonResponse 래퍼 처리 포함
  - 에러 발생 시 자동 로그아웃

### POST /api/v1/auth/logout
- **함수명**: `authApi.logout(): Promise<void>`
- **설명**: 로그아웃 및 Refresh Token 무효화
- **파라미터**: 없음
- **반환값**: void
- **특이사항**:
  - API 호출 성공/실패와 관계없이 로컬 상태 초기화

## 회원 API (`lib/api/members.ts`)

### GET /api/v1/members/me
- **함수명**: `membersApi.getMe(): Promise<User>`
- **설명**: 현재 로그인한 사용자 정보 조회
- **파라미터**: 없음
- **반환값**: User 객체
- **인증**: 필요 (JWT Bearer Token)
- **특이사항**:
  - User 정보를 authStore에 자동 저장
  - 에러 처리 포함

### GET /api/v1/members/exists/email
- **함수명**: `membersApi.validateEmailDuplicated(email: string): Promise<boolean>`
- **설명**: 이메일 중복 검증
- **파라미터**: `{ email: string }` (쿼리 파라미터)
- **반환값**: boolean (true: 사용 가능, false: 중복됨)
- **인증**: 불필요
- **특이사항**:
  - 회원가입 전 이메일 중복 여부 확인용

## 관측지 API (`lib/api/spots.ts`)

### GET /api/v1/spots
- **함수명**: `spotsApi.getObservationSpots(params): Promise<Array<ObservationSpotResponse>>`
- **설명**: 현재 위치와 반경을 기준으로 관측지 조회
- **파라미터**: `{ lat: number, lon: number, radius: number }` (쿼리 파라미터)
- **반환값**: 관측지 목록 (배열)
- **인증**: 불필요
- **특이사항**:
  - 응답이 배열이 아닌 경우 자동으로 배열로 변환
  - 에러 처리 포함

## 별 관측 API (`lib/api/stargazing.ts`)

### GET /api/v1/analyze
- **함수명**: `stargazingApi.analyzeStargazingCondition(params): Promise<StargazingAnalyzeResponse>`
- **설명**: 특정 위치, 날짜, 시간의 별 관측 조건 종합 분석
- **파라미터**: 
  - `{ lat: number, lon: number, date: string, time: { hour: number, minute: number, second?: number, nano?: number } }`
  - **특이사항**: time 객체를 `HH:mm` 형식의 문자열로 변환하여 전달
- **반환값**: 별 관측 조건 분석 결과
- **인증**: 불필요
- **특이사항**:
  - LocalTime 파라미터를 문자열로 변환하는 로직 포함
  - 에러 처리 포함

### GET /api/v1/forecast
- **함수명**: `stargazingApi.getForecast(params): Promise<StargazingForecastResponse>`
- **설명**: 특정 위치의 향후 며칠간의 별 관측 예보 조회
- **파라미터**: 
  - `{ lat: number, lon: number, date: string, time: { hour: number, minute: number, second?: number, nano?: number } }`
  - **특이사항**: time 객체를 `HH:mm` 형식의 문자열로 변환하여 전달
- **반환값**: 별 관측 예보 결과
- **인증**: 불필요
- **특이사항**:
  - LocalTime 파라미터를 문자열로 변환하는 로직 포함
  - 에러 처리 포함

## 북마크 API (`lib/api/bookmarks.ts`)

### GET /api/v1/bookmarks
- **함수명**: `bookmarksApi.getBookmarkList(): Promise<Array<BookmarkResponse>>`
- **설명**: 현재 로그인한 사용자의 북마크 리스트 조회
- **파라미터**: 없음
- **반환값**: 북마크 목록 (배열)
- **인증**: 필요 (JWT Bearer Token)
- **특이사항**:
  - 응답이 배열이 아닌 경우 자동으로 배열로 변환
  - 에러 처리 포함

### POST /api/v1/bookmarks
- **함수명**: `bookmarksApi.addBookmark(data): Promise<BookmarkResponse>`
- **설명**: 새로운 북마크 추가 (SPOT 타입 또는 CUSTOM 타입)
- **파라미터**: 
  - `{ type: 'SPOT' | 'CUSTOM', spotId?: number, name: string, latitude?: number, longitude?: number, address?: string }`
- **반환값**: 추가된 북마크 정보
- **인증**: 필요 (JWT Bearer Token)
- **특이사항**:
  - SPOT 타입: 명소를 북마크로 추가
  - CUSTOM 타입: 사용자가 직접 추가한 나만의 장소
  - 에러 처리 포함

### PUT /api/v1/bookmarks/{bookmarkId}
- **함수명**: `bookmarksApi.modifyBookmark(bookmarkId: number, data): Promise<BookmarkResponse>`
- **설명**: 북마크 이름 수정 (이름만 수정 가능)
- **파라미터**: 
  - `bookmarkId` (경로 파라미터)
  - `{ name: string }` (요청 본문)
- **반환값**: 수정된 북마크 정보
- **인증**: 필요 (JWT Bearer Token)
- **특이사항**:
  - 북마크 이름만 수정 가능
  - 에러 처리 포함

### DELETE /api/v1/bookmarks/{bookmarkId}
- **함수명**: `bookmarksApi.deleteBookmark(bookmarkId: number): Promise<void>`
- **설명**: 북마크 삭제
- **파라미터**: `bookmarkId` (경로 파라미터)
- **반환값**: void
- **인증**: 필요 (JWT Bearer Token)
- **특이사항**:
  - 에러 처리 포함

## 파일 구조

```
lib/api/
├── client.ts          # 기본 API 클라이언트 클래스
├── auth.ts            # 인증 API (4개 엔드포인트)
├── members.ts         # 회원 API (2개 엔드포인트)
├── spots.ts           # 관측지 API (1개 엔드포인트)
├── stargazing.ts      # 별 관측 API (2개 엔드포인트)
├── bookmarks.ts       # 북마크 API (4개 엔드포인트)
├── index.ts           # 통합 export
└── axios.ts           # Axios 인스턴스 및 인터셉터

lib/store/
├── authStore.ts       # 인증 상태 관리 (Zustand)
└── bookmarkStore.ts   # 북마크 상태 관리 (Zustand)

types/
└── openapi.d.ts       # OpenAPI에서 생성된 타입 정의
```

## 총 구현된 엔드포인트 수

- **인증 API**: 4개
- **회원 API**: 2개
- **관측지 API**: 1개
- **별 관측 API**: 2개
- **북마크 API**: 4개
- **총계**: 13개 엔드포인트

## 업데이트 가이드

새로운 OpenAPI JSON이 제공되었을 때:

1. `IMPLEMENTED_APIS.md` 파일을 먼저 확인
2. 새로운 엔드포인트만 추가
3. 기존 엔드포인트의 경우:
   - OpenAPI 스펙이 변경되지 않았다면 수정하지 않음
   - OpenAPI 스펙이 변경되었다면 필요한 부분만 최소한으로 업데이트
   - 특수 처리 로직 (예: LocalTime 변환)은 유지
4. 새로운 API 추가 후 이 파일도 업데이트
