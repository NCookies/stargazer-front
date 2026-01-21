# 인증 모듈 구현 완료

## 구현된 파일 목록

### 1. Axios 설정 및 인터셉터
- **`lib/api/axios.ts`**
  - `withCredentials: true` 설정 (HttpOnly Cookie 지원)
  - Request Interceptor: Access Token을 Authorization 헤더에 자동 주입
  - Response Interceptor: 401 에러 시 자동 토큰 갱신
  - **동시성 제어**: `isRefreshing` 플래그와 `failedQueue`를 사용한 Race Condition 방지

### 2. 상태 관리
- **`lib/store/authStore.ts`**
  - Zustand를 사용한 인증 상태 관리
  - `accessToken`, `isAuthenticated` 상태
  - `setAccessToken`, `logout` 액션
  - localStorage 영속화 (새로고침 시 상태 유지)

### 3. Auth API 서비스
- **`lib/api/authApi.ts`**
  - `login(provider)`: OAuth 로그인 시작 (백엔드로 리다이렉트)
  - `reissue()`: Refresh Token으로 Access Token 재발급
  - `logout()`: 로그아웃 처리

### 4. OAuth Callback 페이지
- **`app/oauth/callback/page.tsx`**
  - URL 파라미터를 읽지 않음 (토큰이 URL에 없음)
  - 컴포넌트 마운트 시 즉시 `reissue()` 호출
  - 성공 시 메인 페이지로 이동, 실패 시 로그인 페이지로 이동
  - React StrictMode 대응: `useRef`로 중복 호출 방지

### 5. 로그인 페이지
- **`app/login/page.tsx`**
  - OAuth 로그인 버튼 제공
  - 이미 로그인된 경우 메인 페이지로 리다이렉트

### 6. 인증 관련 컴포넌트
- **`components/auth/AuthProvider.tsx`**
  - 앱 초기 로딩 시 토큰 갱신 시도 (새로고침 시 로그인 유지)
  - `app/layout.tsx`에 통합됨

- **`components/auth/PrivateRoute.tsx`**
  - 인증이 필요한 페이지를 보호하는 컴포넌트
  - 인증되지 않은 경우 로그인 페이지로 리다이렉트

### 7. Header 업데이트
- **`components/header.tsx`**
  - 로그인/로그아웃 버튼 추가
  - 인증 상태에 따라 버튼 표시

## 주요 기능

### ✅ 동시성 제어 (Race Condition 방지)
- 여러 요청이 동시에 401 에러를 받아도 토큰 갱신은 한 번만 실행
- 갱신 중인 요청들은 큐에 대기 후 순차 처리

### ✅ 자동 토큰 갱신
- 401 에러 발생 시 자동으로 `/reissue` 호출
- 새 Access Token으로 원래 요청 자동 재시도

### ✅ 새로고침 시 로그인 유지
- `AuthProvider`에서 초기 로딩 시 토큰 갱신 시도
- localStorage에 Access Token 저장

### ✅ HttpOnly Cookie 지원
- `withCredentials: true` 설정으로 Refresh Token 자동 전송
- XSS 공격으로부터 Refresh Token 보호

## 사용 방법

### 1. 보호된 페이지 만들기
```tsx
import { PrivateRoute } from '@/components/auth/PrivateRoute'

export default function ProtectedPage() {
  return (
    <PrivateRoute>
      <div>인증이 필요한 콘텐츠</div>
    </PrivateRoute>
  )
}
```

### 2. API 호출하기
```tsx
import { apiClient } from '@/lib/api/axios'

// Access Token이 자동으로 헤더에 추가됨
const response = await apiClient.get('/api/v1/some-endpoint')
```

### 3. 로그인/로그아웃
```tsx
import { authApi } from '@/lib/api/authApi'

// 로그인
authApi.login('google')

// 로그아웃
await authApi.logout()
```

### 4. 인증 상태 확인
```tsx
import { authStore } from '@/lib/store/authStore'

const isAuthenticated = authStore((state) => state.isAuthenticated)
const accessToken = authStore((state) => state.accessToken)
```

## 환경 변수

`.env.local` 파일에 다음 변수를 설정하세요:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

기본값은 `http://localhost:8080`입니다.

## 백엔드 API 엔드포인트

구현된 코드는 다음 백엔드 API를 사용합니다:

- `POST /api/v1/auth/reissue` - Access Token 재발급
- `POST /api/v1/auth/logout` - 로그아웃
- `GET /oauth2/authorization/{provider}` - OAuth 로그인 시작

## 주의사항

1. **OAuth Callback URL**: 백엔드에서 `/oauth/callback`으로 리다이렉트하도록 설정되어 있어야 합니다.
2. **CORS 설정**: 백엔드에서 `withCredentials: true`를 지원하도록 CORS 설정이 필요합니다.
3. **Refresh Token**: HttpOnly Cookie로 전송되므로 JavaScript에서 직접 접근할 수 없습니다.
